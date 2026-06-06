"use client"

import { useState, useCallback, useEffect } from "react"
import Papa from 'papaparse';
import { DashboardHeader } from "@/components/dashboard-header"
import { Dropzone } from "@/components/dropzone"
import { OrdersTable, type Order } from "@/components/orders-table"
import { MapView } from "@/components/map-view"
import { StatsCards } from "@/components/stats-cards"
import { OptimizeButton } from "@/components/optimize-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from "firebase/firestore"

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [docId, setDocId] = useState<string | null>(null)
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  useEffect(() => {
    // Filtro estricto: solo escucha estados activos, ignora ARCHIVED
    const q = query(
      collection(db, "tenants/SURA/pending_optimizations"), 
      where("status", "in", ["REQUESTED", "OPTIMIZED"]),
      orderBy("created_at", "desc"), 
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const latestDoc = snap.docs[0];
        const data = latestDoc.data();

        setDocId(latestDoc.id);
        setEncodedPolyline(data.encoded_polyline || null);

        onSnapshot(collection(db, `tenants/SURA/pending_optimizations/${latestDoc.id}/validated_stops`), (stopsSnap) => {
          const points = stopsSnap.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            isValidated: d.data().precision_color === "VERDE" 
          }));
          setOrders(points.sort((a,b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
        });
      } else {
        // Si no hay documentos activos, limpiamos la UI
        setOrders([]);
        setDocId(null);
        setEncodedPolyline(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFilesUploaded = useCallback((files: File[]) => {
    if (files.length === 0) return;
    Papa.parse(files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row: any, i: number) => ({
          id: row.id || `PED-${i}-${Date.now()}`,
          address: row.direccion || row.address,
          neighborhood: row.barrio || "Analizando...",
          precision_color: "NEUTRAL",
          lat: 6.2442,
          lng: -75.5812,
          isValidated: false
        }));
        setOrders(parsed.slice(0, 50));
      }
    });
  }, []);

  const handleOptimize = useCallback(async () => {
    if (orders.length === 0) return;
    setIsOptimizing(true);
    try {
      // 1. Si existe un docId activo, lo archivamos primero para evitar duplicados
      if (docId) {
        await updateDoc(doc(db, "tenants/SURA/pending_optimizations", docId), { status: "ARCHIVED" });
      }
      // 2. Creamos la nueva solicitud
      await addDoc(collection(db, "tenants/SURA/pending_optimizations"), {
        status: "REQUESTED",
        raw_addresses: orders.map(o => ({ id: o.id, address: o.address })),
        created_at: serverTimestamp(),
        vehicle_count: 1
      });
    } catch (e) {
      console.error("Error optimizando:", e);
    } finally {
      setIsOptimizing(false);
    }
  }, [orders, docId]);

  const handleArchive = async () => {
    if (!docId) return;
    setIsArchiving(true);
    try {
      await updateDoc(doc(db, "tenants/SURA/pending_optimizations", docId), {
        status: "ARCHIVED"
      });
    } catch (error) {
      console.error("Error al archivar:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <StatsCards 
            totalOrders={orders.length} 
            validatedOrders={orders.filter(o => o.precision_color === "VERDE").length} 
            pendingOrders={orders.filter(o => o.precision_color === "NARANJA").length} 
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary" /> Cargar Pedidos</CardTitle></CardHeader>
                <CardContent><Dropzone onFilesUploaded={handleFilesUploaded} /></CardContent>
              </Card>
              <div className="max-h-[450px] overflow-auto rounded-md border border-border">
                <OrdersTable orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <OptimizeButton disabled={orders.length === 0 || isOptimizing} onOptimize={handleOptimize} loading={isOptimizing} />
                </div>
                {docId && (
                  <Button variant="secondary" onClick={handleArchive} disabled={isArchiving || isOptimizing} className="h-14 px-8 text-base font-semibold">
                    {isArchiving ? "Archivando..." : "Archivar Ruta"}
                  </Button>
                )}
              </div>
            </div>
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" /> Refinador de Pines v.1.5</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] relative">
                  <MapView orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} docId={docId} encodedPolyline={encodedPolyline} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
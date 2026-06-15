"use client"

import { useState, useCallback, useEffect } from "react"
import Papa from 'papaparse';
import { DashboardHeader } from "@/components/dashboard-header"
import { Dropzone } from "@/components/dropzone"
import { OrdersTable } from "@/components/orders-table"
import { MapView } from "@/components/map-view"
import { StatsCards } from "@/components/stats-cards"
import { OptimizeButton } from "@/components/optimize-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from "firebase/firestore"

import { useAuth } from "@/components/auth-provider";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([])
  const [docId, setDocId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // 📡 RADAR 1: Escucha el documento principal (Estado y Ruta)
  useEffect(() => {
    if (!user) return;
    console.log("LOG: 📡 Iniciando radar principal...");

    const q = query(
      collection(db, "tenants/SURA/pending_optimizations"), 
      where("status", "in", ["REQUESTED_V5", "VALIDATED", "OPTIMIZED"]),
      orderBy("created_at", "desc"), 
      limit(1)
    );

    const unsubscribeMain = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const latestDoc = snap.docs[0];
        const data = latestDoc.data();
        
        console.log(`LOG: 📄 Documento detectado: ${data.status}`);
        setDocId(latestDoc.id);
        setStatus(data.status);
        setEncodedPolyline(data.encoded_polyline || null);
      } else {
        // Limpiar si no hay rutas activas
        setDocId(null);
        setStatus(null);
        setEncodedPolyline(null);
        setOrders([]); 
      }
    });

    return () => unsubscribeMain();
  }, [user]);

  // 📍 RADAR 2: Escucha EXCLUSIVAMENTE los pines (Depende del docId)
  useEffect(() => {
    if (!docId) return;
    console.log(`LOG: 📍 Iniciando radar de pines para el doc: ${docId}`);

    const unsubscribeStops = onSnapshot(
      collection(db, `tenants/SURA/pending_optimizations/${docId}/validated_stops`), 
      (stopsSnap) => {
        const points = stopsSnap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(), 
          isValidated: d.data().precision_color === "VERDE" 
        }));
        
        if (points.length > 0) {
          console.log(`LOG: 📍 Pines recibidos y dibujados: ${points.length}`);
          // Creamos una copia nueva del arreglo [...points] para forzar a React a dibujar
          setOrders([...points].sort((a,b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
        }
      }
    );

    return () => unsubscribeStops();
  }, [docId]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    if (files.length === 0) return;
    Papa.parse(files[0], {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row: any, i: number) => ({
          id: row.id || `PED-${i}-${Date.now()}`,
          address: row.direccion || row.address,
          neighborhood: row.barrio || "Analizando...",
          precision_color: "NEUTRAL"
        }));
        setOrders(parsed.slice(0, 50));
      }
    });
  }, []);

  const handleOptimize = useCallback(async () => {
    if (orders.length === 0) return;
    setIsOptimizing(true);
    console.log("LOG: 🚀 Enviando a optimizar...");
    try {
      await addDoc(collection(db, "tenants/SURA/pending_optimizations"), {
        status: "REQUESTED_V5", // <--- FÍJATE EN EL V5
        raw_addresses: orders.map(o => ({ 
          id: o.id, 
          address: o.address,
          neighborhood: o.neighborhood || "N/A", 
          phone: o.phone || "N/A"
        })),
        created_at: serverTimestamp(),
        vehicle_count: 1
      });
      console.log("LOG: ✅ Documento creado con éxito");
      setIsOptimizing(false); // <--- CORRECCIÓN CRÍTICA: Apagamos el botón de carga
    } catch (e) {
      console.error("LOG: ❌ Error al crear documento:", e);
      setIsOptimizing(false);
    }
  }, [orders]);

  const handleArchive = async () => {
    if (!docId) return;
    setIsArchiving(true);
    try {
      await updateDoc(doc(db, "tenants/SURA/pending_optimizations", docId), { status: "ARCHIVED" });
    } finally {
      setIsArchiving(false);
    }
  };

  // --- PASO 3: PROTECCIÓN DE ACCESO ---
  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-background text-white">Cargando NodoNet...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">NodoNet AI</h1>
        <button 
          onClick={() => signInWithPopup(auth, googleProvider)}
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl"
        >
          Acceder con Google
        </button>
      </div>
    );
  }
  // ------------------------------------
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <StatsCards 
          // Restamos 2 (origen y destino) para saber los pedidos reales. Usamos Math.max para que nunca sea negativo.
          totalOrders={Math.max(0, orders.length - 2)} 
          validatedOrders={orders.filter(o => o.precision_color === "VERDE").length} 
          // Todo lo que NO sea VERDE, se considera pendiente de revisión (NARANJA o NEUTRAL)
          pendingOrders={orders.filter(o => o.precision_color !== "VERDE").length} 
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
                  <OptimizeButton 
                    disabled={orders.length === 0 || status === "REQUESTED" || isOptimizing} 
                    onOptimize={handleOptimize} 
                    loading={isOptimizing || status === "REQUESTED"} 
                  />
                </div>
                {docId && (
                  <Button variant="secondary" onClick={handleArchive} disabled={isArchiving} className="h-14 px-8 text-base font-semibold">
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

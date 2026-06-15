"use client"

import React, { useMemo, useEffect } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

// COMPONENTE PARA DIBUJAR LA RUTA CON FLECHAS DE SENTIDO EN EL ADMIN
const GlowPolyline = ({ encodedPath }: { encodedPath: string }) => {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const path = useMemo(() => {
    if (!geometryLib || !encodedPath) return [];
    return geometryLib.encoding.decodePath(encodedPath);
  }, [geometryLib, encodedPath]);

  useEffect(() => {
    if (!map || path.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, { padding: 40 });

    // RESTAURACIÓN DE FLECHAS BLANCAS PARA SENTIDO DE RUTA
    const line = new google.maps.Polyline({
      path,
      map,
      strokeColor: '#3b82f6', // Azul NodoNet
      strokeOpacity: 0.8,
      strokeWeight: 6,
      zIndex: 2,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#ffffff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          scale: 3, // Tamaño visible para Admin
          strokeWeight: 2
        },
        offset: '50px',
        repeat: '100px'
      }],
    });
    return () => line.setMap(null);
  }, [map, path]);
  return null;
};

export function MapView({ orders, selectedOrderId, onSelectOrder, docId, encodedPolyline }: any) {
  
  const handleDragEnd = async (orderId: string, e: google.maps.MapMouseEvent) => {
    const newLat = e.latLng?.lat();
    const newLng = e.latLng?.lng();

    if (newLat && newLng && docId) {
      try {
        const stopRef = doc(db, `tenants/SURA/pending_optimizations/${docId}/validated_stops`, orderId);
        const mainDocRef = doc(db, "tenants/SURA/pending_optimizations", docId);

        // 1. Actualizamos la parada con coordenadas de "Verdad Terrenal"
        await updateDoc(stopRef, {
          confirmed_coordinate: { lat: newLat, lng: newLng },
          lat: newLat,
          lng: newLng,
          precision_color: "VERDE",
          is_manual: true,
          needs_review: false
        });

        // 2. DISPARADOR DE RE-OPTIMIZACIÓN: Despierta al Agente v.53
        await updateDoc(mainDocRef, {
          status: "REQUESTED_V5",
          updated_at: serverTimestamp()
        });

        toast.success("Ubicación ajustada. Re-optimizando ruta de enjambre...");
      } catch (error) {
        console.error("Error al mover pin:", error);
        toast.error("Error al actualizar ubicación.");
      }
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={['geometry']}>
      <Map
        defaultCenter={{ lat: 6.1759, lng: -75.5917 }}
        defaultZoom={13}
        mapId="NODONET_ADMIN_V5"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {orders && orders.map((order: any, index: number) => {
          if (!order.lat || !order.lng) return null;
          const isSelected = selectedOrderId === order.id;

          return (
            <AdvancedMarker
              key={order.id}
              position={{ lat: Number(order.lat), lng: Number(order.lng) }}
              draggable={true} 
              onDragEnd={(e) => handleDragEnd(order.id, e)}
              onClick={() => onSelectOrder(order.id)}
              zIndex={isSelected ? 100 : 1}
            >
              <Pin
                background={order.precision_color === "NARANJA" ? "#f97316" : "#22c55e"}
                borderColor={order.is_manual ? "#FFD700" : "#ffffff"}
                glyphColor={"#ffffff"}
                // Priorizar el orden indexado por la IA sobre el índice del array
                glyph={(order.order_index !== undefined ? order.order_index + 1 : index + 1).toString()}
                scale={isSelected ? 1.3 : 1.0}
              />
            </AdvancedMarker>
          );
        })}

        {/* RENDER DE LA POLYLINE CON FLECHAS DIRECCIONALES */}
        {encodedPolyline && <GlowPolyline encodedPath={encodedPolyline} />}
      </Map>
    </APIProvider>
  );
}
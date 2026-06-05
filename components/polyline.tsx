"use client"

import { useEffect, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const DirectionsRoute = ({ listenerId }: { listenerId: string }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const [encodedPath, setEncodedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!listenerId) return;

    // Escuchamos el campo 'encoded_polyline' que creará el Agente en la Fase GRA-003
    const docRef = doc(db, "tenants/SURA/pending_optimizations", listenerId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.encoded_polyline) {
          console.log("🛣️ Ruta recibida desde el Agente!");
          setEncodedPath(data.encoded_polyline);
        }
      }
    });

    return () => unsubscribe();
  }, [listenerId]);

  useEffect(() => {
    if (!map || !mapsLib || !encodedPath) return;

    // Decodifica la cadena de texto en puntos geográficos
    const path = google.maps.geometry.encoding.decodePath(encodedPath);

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#3b82f6', // Azul NodoNet
      strokeOpacity: 0.8,
      strokeWeight: 5,
      map: map
    });

    return () => polyline.setMap(null);
  }, [map, mapsLib, encodedPath]);

  return null;
};
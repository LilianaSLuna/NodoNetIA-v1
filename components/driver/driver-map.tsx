"use client"

import React, { useMemo, useEffect } from 'react';
import { 
  APIProvider, Map, useMap, useMapsLibrary, 
  AdvancedMarker, Pin, ControlPosition 
} from '@vis.gl/react-google-maps';

/**
 * Hito 4.0 - Versión v.3.0
 * Componente: DriverMap - Conciencia Situacional y Geofencing Visual
 */

// --- SUB-COMPONENTE: VISUALIZADOR DE GEOCERCA ---
const GeofenceCircle = ({ center, radius }: { center: google.maps.LatLngLiteral, radius: number }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !center) return;
    const circle = new google.maps.Circle({
      map,
      center,
      radius,
      fillColor: '#2563eb',
      fillOpacity: 0.1,
      strokeColor: '#2563eb',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      clickable: false,
      zIndex: 1
    });
    return () => circle.setMap(null);
  }, [map, center, radius]);
  return null;
};

// --- SUB-COMPONENTE: MARCADOR DE REPARTIDOR (USER) ---
const UserMarker = ({ location }: { location: { lat: number, lng: number } | null }) => {
  if (!location) return null;
  return (
    <AdvancedMarker position={location} zIndex={1000}>
      <div className="relative flex items-center justify-center">
        {/* Halo de Precisión GPS */}
        <div className="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-pulse border border-blue-500/40" />
        {/* Punto Central (Repartidor) */}
        <div className="w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
        </div>
      </div>
    </AdvancedMarker>
  );
};

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

    const line = new google.maps.Polyline({
      path,
      map,
      strokeColor: '#2563eb', 
      strokeOpacity: 1.0,
      strokeWeight: 6,
      zIndex: 2,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#ffffff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          scale: 2.5
        },
        offset: '50px',
        repeat: '100px'
      }],
    });
    return () => line.setMap(null);
  }, [map, path]);
  return null;
};

const StopMarkers = ({ stops, currentStopIndex }: { stops: any[], currentStopIndex: number }) => {
  return (
    <>
      {stops.map((stop, index) => {
        const isDelivered = stop.status === "DELIVERED" || index < currentStopIndex;
        const isCurrent = index === currentStopIndex;
        const isGroundTruth = stop.confirmed_coordinate !== undefined && stop.confirmed_coordinate !== null;
        const stopNumber = (stop.order_index ?? index) + 1;

        let bgColor = "#2563eb"; 
        if (stop.precision_color === "NARANJA") bgColor = "#f97316"; 
        if (isDelivered) bgColor = "#10b981"; 
        if (isCurrent) bgColor = "#f59e0b"; 

        return (
          <AdvancedMarker 
            key={stop.id} 
            position={{ lat: Number(stop.lat), lng: Number(stop.lng) }} 
            zIndex={isCurrent ? 100 : index}
          >
            {isGroundTruth && !isDelivered && (
              <div className="absolute -inset-2 rounded-full animate-ping bg-yellow-400/40 z-[-1]" />
            )}
            <Pin 
              background={bgColor} 
              borderColor={isGroundTruth ? "#FFD700" : "#ffffff"} 
              glyphColor={"#ffffff"} 
              glyph={isDelivered ? "✓" : stopNumber.toString()}
              scale={isCurrent ? 1.3 : 1.0}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export function DriverMap({ stops, currentStopIndex, encodedPolyline, userLocation }: any) {
  const currentStop = stops[currentStopIndex];
  
  // Posición de la Geocerca (Prioriza coordenada confirmada)
  const geofenceCenter = useMemo(() => {
    if (!currentStop) return null;
    return {
      lat: Number(currentStop.confirmed_coordinate?.lat || currentStop.lat),
      lng: Number(currentStop.confirmed_coordinate?.lng || currentStop.lng)
    };
  }, [currentStop]);

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative bg-muted">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={['geometry']}>
        <Map 
          defaultCenter={{ lat: 6.1759, lng: -75.5917 }} 
          defaultZoom={15} 
          mapId="NODONET_DRIVER_V6"
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          reuseMaps={true} // Optimización de memoria para PWA
        >
          {/* Capas de Marcadores y Rutas */}
          <StopMarkers stops={stops} currentStopIndex={currentStopIndex} />
          {encodedPolyline && <GlowPolyline encodedPath={encodedPolyline} />}
          
          {/* Capa de Geofencing ( FIELDPROOF ) */}
          {geofenceCenter && <GeofenceCircle center={geofenceCenter} radius={50} />}
          
          {/* Capa de Usuario (Shadow Pin) */}
          <UserMarker location={userLocation} />
        </Map>
      </APIProvider>

      {/* Etiquetas de Versión y Estado */}
      <div className="absolute bottom-3 left-3 flex gap-1.5">
        <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase border border-white/20">
          FIELDPROOF v.3.0
        </div>
        {!userLocation && (
          <div className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase animate-pulse">
            Buscando GPS...
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold border border-white/10 shadow-lg">
        MODO RESILIENTE
      </div>
    </div>
  );
}
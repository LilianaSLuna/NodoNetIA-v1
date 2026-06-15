"use client"

import { useState, useEffect, useMemo } from "react"
import { flushSync } from "react-dom"
import { DriverHeader } from "@/components/driver/driver-header"
import { DriverMap } from "@/components/driver/driver-map"
import { CurrentStop } from "@/components/driver/current-stop"
import { NextStops } from "@/components/driver/next-stops"
import { RouteProgress } from "@/components/driver/route-progress"
import { ActionPanel } from "@/components/driver/action-panel"
import { db, storage } from "@/lib/firebase" 
import { 
  collection, query, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp
} from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

const NETWORK_TIMEOUT = 7000;

export default function DriverPage() {
  const { user, loading: authLoading } = useAuth();
  const [stops, setStops] = useState<any[]>([])
  const [docId, setDocId] = useState<string | null>(null)
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [isUploading, setIsUploading] = useState(false)
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isContingencyActive, setIsContingencyActive] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Permiso de GPS denegado o lento, continuando sin él:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (isOnline && docId && stops.length > 0) {
      const flushOfflineQueue = async () => {
        const queue = JSON.parse(localStorage.getItem('offline_deliveries') || '[]');
        if (queue.length === 0) return;

        const remainingQueue = [];
        for (const item of queue) {
          try {
            let photoUrl = null;
            if (item.evidencePhoto) {
              const sRef = ref(storage, `evidences/${item.docId}/${item.stopId}.jpg`);
              await uploadString(sRef, item.evidencePhoto, 'data_url');
              photoUrl = await getDownloadURL(sRef);
            }
            await updateDoc(doc(db, `tenants/SURA/pending_optimizations/${item.docId}/validated_stops`, item.stopId), {
              status: "DELIVERED",
              evidence_url: photoUrl,
              delivered_at: serverTimestamp(),
              confirmed_coordinate: item.data.confirmed_coordinate || null
            });
          } catch (err) {
            remainingQueue.push(item);
          }
        }
        localStorage.setItem('offline_deliveries', JSON.stringify(remainingQueue));
      };
      flushOfflineQueue();
    }
  }, [isOnline, docId, stops.length]);

  useEffect(() => {
    if (!user) return; 

    const q = query(collection(db, "tenants/SURA/pending_optimizations"), orderBy("created_at", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) { setIsLoading(false); return; }
      
      const latest = snapshot.docs[0];
      const id = latest.id;
      setDocId(id);
      setEncodedPolyline(latest.data().encoded_polyline || null);
      
      onSnapshot(query(collection(db, `tenants/SURA/pending_optimizations/${id}/validated_stops`), orderBy("order_index", "asc")), 
        (snap) => {
          const fetchedStops = snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id, ...data,
              lat: Number(data.lat) || 0, lng: Number(data.lng) || 0,
              duration: Number(data.duration) || 0, time: Number(data.time) || 0, order_index: Number(data.order_index) || 0
            };
          });
          
          setStops(fetchedStops);
          const savedProgress = localStorage.getItem(`nodonet_progress_${id}`);
          if (savedProgress) {
            const parsedIndex = parseInt(savedProgress, 10);
            if (parsedIndex >= 0 && parsedIndex < fetchedStops.length) setCurrentStopIndex(parsedIndex);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error al leer paradas (Posible Auth):", error);
          setIsLoading(false);
        }
      );
    }, (error) => {
      console.error("Error al leer documento principal:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- REGLA DE REACT: TODOS LOS HOOKS DEBEN IR ANTES DE LOS RETURNS ---
  const currentStop = useMemo(() => stops[currentStopIndex] || null, [stops, currentStopIndex]);

  const isNear = useMemo(() => {
    if (!userLocation || !currentStop || typeof currentStop.lat !== 'number' || typeof currentStop.lng !== 'number') {
      return false;
    }
    const R = 6371000; 
    const dLat = (currentStop.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (currentStop.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(currentStop.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) <= 50; 
  }, [userLocation, currentStop]);

  const routeMetrics = useMemo(() => {
    if (!stops || stops.length === 0) return { remainingTimeStr: "0h 0m", pendingCount: 0 };
    
    const remainingStops = stops.slice(currentStopIndex);
    let totalMinutes = 0;
    
    remainingStops.forEach(s => {
      const stopMinutes = Number(s.duration) || Number(s.estimated_duration) || Number(s.time) || 0;
      totalMinutes += stopMinutes;
    });

    const hours = Math.floor(totalMinutes / 60) || 0;
    const mins = Math.round(totalMinutes % 60) || 0;

    return {
      remainingTimeStr: `${hours}h ${mins}m`,
      pendingCount: remainingStops.length
    };
  }, [stops, currentStopIndex]);

  const handleComplete = async () => {
    if (!currentStop || !docId || isUploading) return;
    setIsUploading(true); 

    const finalizeLocal = () => {
      const queue = JSON.parse(localStorage.getItem('offline_deliveries') || '[]');
      const newPayload = { 
        docId, stopId: currentStop.id, evidencePhoto,
        data: { 
          status: "DELIVERED", confirmed_coordinate: userLocation || { lat: currentStop.lat, lng: currentStop.lng },
          is_ground_truth: true, delivered_at: new Date().toISOString(), offline_flag: true
        } 
      };
      
      queue.push(newPayload);
      
      try {
        localStorage.setItem('offline_deliveries', JSON.stringify(queue));
      } catch (quotaError) {
        console.warn("localStorage quota exceeded, saving textual manifest payload without image element.");
        newPayload.evidencePhoto = null; 
        const lightQueue = JSON.parse(localStorage.getItem('offline_deliveries') || '[]');
        lightQueue.push(newPayload);
        try {
          localStorage.setItem('offline_deliveries', JSON.stringify(lightQueue));
        } catch (innerErr) {
          localStorage.removeItem('offline_deliveries');
          localStorage.setItem('offline_deliveries', JSON.stringify([newPayload]));
        }
      }
    };

    try {
      if (isOnline) {
        await Promise.race([
          (async () => {
            let photoUrl = null;
            if (evidencePhoto) {
              const sRef = ref(storage, `evidences/${docId}/${currentStop.id}.jpg`);
              await uploadString(sRef, evidencePhoto, 'data_url');
              photoUrl = await getDownloadURL(sRef);
            }
            await updateDoc(doc(db, `tenants/SURA/pending_optimizations/${docId}/validated_stops`, currentStop.id), {
              status: "DELIVERED", evidence_url: photoUrl, delivered_at: serverTimestamp()
            });
          })(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), NETWORK_TIMEOUT))
        ]);
      } else { finalizeLocal(); }
    } catch (e) { 
      finalizeLocal(); 
    } finally {
      flushSync(() => {
        setIsUploading(false);
        setIsTransitioning(true);
      });

      setTimeout(() => {
        flushSync(() => {
          setEvidencePhoto(null);
          setIsContingencyActive(false);
          const nextIndex = currentStopIndex + 1;
          if (nextIndex < stops.length) {
            setCurrentStopIndex(nextIndex);
            localStorage.setItem(`nodonet_progress_${docId}`, String(nextIndex));
          }
        });

        setTimeout(() => {
          setIsTransitioning(false);
        }, 600);
      }, 1200);
    }
  };

  const handleSkip = async () => {
    if (!currentStop || !docId || isUploading) return;
    setIsUploading(true);

    const finalizeLocalSkip = () => {
      const queue = JSON.parse(localStorage.getItem('offline_deliveries') || '[]');
      queue.push({
        docId, stopId: currentStop.id, evidencePhoto: null,
        data: { 
          status: "SKIPPED", 
          delivered_at: new Date().toISOString(), 
          offline_flag: true 
        }
      });
      localStorage.setItem('offline_deliveries', JSON.stringify(queue));
    };

    try {
      if (isOnline) {
        await updateDoc(doc(db, `tenants/SURA/pending_optimizations/${docId}/validated_stops`, currentStop.id), {
          status: "SKIPPED", skipped_at: serverTimestamp()
        });
      } else { finalizeLocalSkip(); }
    } catch (e) {
      finalizeLocalSkip();
    } finally {
      flushSync(() => { setIsUploading(false); setIsTransitioning(true); });
      setTimeout(() => {
        flushSync(() => {
          setEvidencePhoto(null);
          setIsContingencyActive(false);
          const nextIndex = currentStopIndex + 1;
          if (nextIndex < stops.length) {
            setCurrentStopIndex(nextIndex);
            localStorage.setItem(`nodonet_progress_${docId}`, String(nextIndex));
          }
        });
        setTimeout(() => setIsTransitioning(false), 600);
      }, 1200);
    }
  };

  // --- CONDICIONALES DE RENDERIZADO VISUAL AQUÍ AL FINAL ---
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest">Autenticando...</div>;
  
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
        <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">NodoNet Repartidor</h1>
        <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl">
          Acceder con Google
        </button>
      </div>
    );
  }

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-slate-100 bg-slate-950 uppercase tracking-widest">Descargando Ruta...</div>;

  const safeCompleted = Number(currentStopIndex) || 0;
  const safeTotal = Number(stops.length) || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden font-sans antialiased">
      <DriverHeader isOnline={isOnline} />
      
      <main key={`stop-view-index-${currentStopIndex}`} className="flex-1 overflow-y-auto pb-44">
        <div className="px-4 pt-4">
          <DriverMap 
            stops={stops} 
            currentStopIndex={currentStopIndex} 
            encodedPolyline={encodedPolyline} 
            userLocation={userLocation} 
          />
        </div>

        <div className="px-4 py-4">
          <RouteProgress completed={safeCompleted} total={safeTotal} remainingTime={routeMetrics.remainingTimeStr} pendingStops={routeMetrics.pendingCount} />
        </div>

        <div className="px-4">
          <CurrentStop 
            stop={currentStop} 
            evidencePhoto={evidencePhoto}
            onPhotoCapture={setEvidencePhoto}
            isUploading={isUploading}
            isVisible={!isTransitioning}
            hasActiveRoute={stops.length > 0}
          />
        </div>

        <div className="px-4 pb-4 mt-6">
          <NextStops stops={stops} currentIndex={currentStopIndex} />
        </div>
      </main>

      <ActionPanel 
        isNear={isNear}
        isUploading={isUploading}
        isContingencyActive={isContingencyActive}
        onToggleContingency={() => setIsContingencyActive(!isContingencyActive)}
        onComplete={handleComplete}
        onSkip={handleSkip} 
        isVisible={!!currentStop && !isTransitioning}
      />

      <div className={cn(
        "fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center transition-all duration-500 ease-out",
        isTransitioning ? "opacity-100 scale-100 visible" : "opacity-0 scale-105 invisible pointer-events-none"
      )}>
        <div className="text-8xl mb-6 drop-shadow-lg animate-bounce">⚡</div>
        <h2 className="text-blue-500 font-black text-4xl tracking-tighter uppercase italic text-center px-8 leading-none">
          REGISTRO<br/><span className="text-white">PROCESADO</span>
        </h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-6 animate-pulse">Sincronizando siguiente parada...</p>
      </div>
    </div>
  );
}
"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Hito MVP STABLE MASTER - Versión v.31.0 (PRESERVADO EN SU TOTALIDAD)
 */

interface CurrentStopProps {
  stop: any | null
  evidencePhoto: string | null
  onPhotoCapture: (base64: string | null) => void
  isUploading: boolean
  isVisible: boolean
  hasActiveRoute: boolean
}

export function CurrentStop({ 
  stop, evidencePhoto, onPhotoCapture, isUploading, isVisible, hasActiveRoute 
}: CurrentStopProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPhotoCapture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!stop) {
    return (
      <div className="bg-slate-900 border-2 border-dashed border-slate-800 p-12 rounded-[2.5rem] text-center w-full">
        <span className="text-5xl block mb-4">{hasActiveRoute ? "🏁" : "⏳"}</span>
        <h3 className="font-black text-xl text-white uppercase tracking-tight">
          {hasActiveRoute ? "Ruta Finalizada" : "Esperando asignación de ruta"}
        </h3>
        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mt-1">
          {hasActiveRoute ? "No quedan paradas pendientes" : "Introduzca el archivo .csv desde el panel administrador"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-300 w-full",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
    )}>
      <Card className="bg-slate-900 border border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8">
          <span className="text-xs font-black tracking-widest text-blue-500 uppercase block mb-1">CLIENTE DESTINO</span>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic leading-tight">
            {stop.customerName || "SURA ASIGNADO"}
          </h2>
          
          <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
            <span className="text-2xl shrink-0 mt-0.5">📍</span>
            <p className="text-lg font-bold text-slate-300 leading-snug">
              {stop.address}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              className="h-16 font-black text-sm rounded-xl bg-slate-800 text-white border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider"
              onClick={() => { if(stop?.phone) window.open(`tel:${stop.phone}`); }}
              disabled={isUploading}
            >
              📞 LLAMAR
            </button>
            <button 
              className="h-16 font-black text-sm rounded-xl bg-slate-800 text-white border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider opacity-40 cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
              disabled={true}
            >
              💬 CHAT (MVP)
            </button>
          </div>
          
          <div className="relative h-56 w-full bg-slate-950 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-800 overflow-hidden shadow-inner">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFile} />
            
            {evidencePhoto ? (
              <div className="relative w-full h-full">
                <img src={evidencePhoto} alt="POD Evidence" className="w-full h-full object-cover" />
                <button 
                  onClick={() => onPhotoCapture(null)} 
                  className="absolute top-3 right-3 bg-black/70 px-4 py-2 rounded-xl text-white font-black text-sm backdrop-blur-md border border-white/10"
                  disabled={isUploading}
                >
                  ✕ REMOVER
                </button>
              </div>
            ) : (
              <button 
                className="flex flex-col items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors w-full h-full justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <div className="text-4xl bg-slate-900 p-4 rounded-full border border-slate-800 shadow-md">📸</div>
                <span className="font-black text-xs uppercase tracking-widest text-slate-400">Capturar Foto Evidencia</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
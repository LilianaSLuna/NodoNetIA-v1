"use client"

import { cn } from "@/lib/utils"

/**
 * Hito MVP STABLE MASTER - Versión v.18.0 (SKIP CAPABILITY)
 */

interface ActionPanelProps {
  isNear: boolean
  isUploading: boolean
  isContingencyActive: boolean
  onToggleContingency: () => void
  onComplete: () => void
  onSkip: () => void // <--- NUEVA PROPIEDAD
  isVisible: boolean
}

export function ActionPanel({ 
  isNear, 
  isUploading, 
  isContingencyActive, 
  onToggleContingency, 
  onComplete, 
  onSkip, // <--- NUEVA PROPIEDAD
  isVisible 
}: ActionPanelProps) {
  
  if (!isVisible) return null;

  const canFinalize = (isNear || isContingencyActive) && !isUploading;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12 pointer-events-none z-50">
      <div className="max-w-md mx-auto w-full space-y-3 pointer-events-auto">
        
        {/* BOTÓN DE CONTINGENCIA GEOCERCA */}
        {!isNear && !isUploading && (
          <button 
            onClick={onToggleContingency}
            className={cn(
              "w-full py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md border",
              isContingencyActive 
                ? "bg-orange-600 border-orange-700 text-white font-black" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            )}
          >
            {isContingencyActive ? "⚠️ Contingencia GPS: Activa" : "Fuera de rango? Activar Contingencia"}
          </button>
        )}

        {/* CONTENEDOR DE BOTONES DE ACCIÓN */}
        <div className="flex gap-3">
          {/* BOTÓN SALTAR */}
          <button
            onClick={onSkip}
            disabled={isUploading}
            className={cn(
              "w-1/3 h-24 rounded-3xl flex flex-col items-center justify-center gap-1 border-b-[6px] transition-all transform relative overflow-hidden",
              !isUploading 
                ? "bg-red-950 border-red-900 text-red-500 active:border-b-0 active:translate-y-1.5 cursor-pointer hover:bg-red-900 hover:text-red-400" 
                : "bg-slate-800 border-slate-950 text-slate-600 cursor-not-allowed opacity-40"
            )}
          >
            <span className="text-2xl mb-1">⏭️</span>
            <span className="font-black text-sm tracking-widest uppercase">Saltar</span>
          </button>

          {/* BOTÓN COMPLETAR */}
          <button
            onClick={onComplete}
            disabled={!canFinalize}
            style={{ backgroundColor: canFinalize ? '#98BA21' : undefined }}
            className={cn(
              "flex-1 h-24 rounded-3xl flex items-center justify-center gap-4 border-b-[8px] transition-all transform relative overflow-hidden",
              canFinalize 
                ? "border-lime-900 text-slate-950 active:border-b-0 active:translate-y-2 cursor-pointer" 
                : "bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed opacity-40"
            )}
          >
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-slate-500 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-lg font-bold uppercase tracking-wide text-slate-400">PROCESANDO...</span>
              </div>
            ) : (
              <span className="font-black text-2xl tracking-tight normal-case">Finalizar Pedido</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { cn } from "@/lib/utils"

/**
 * Hito MVP STABLE MASTER - Versión v.17.0 (PRESERVADO EN SU TOTALIDAD)
 */

interface ActionPanelProps {
  isNear: boolean
  isUploading: boolean
  isContingencyActive: boolean
  onToggleContingency: () => void
  onComplete: () => void
  isVisible: boolean
}

export function ActionPanel({ 
  isNear, 
  isUploading, 
  isContingencyActive, 
  onToggleContingency, 
  onComplete, 
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

        <button
          onClick={onComplete}
          disabled={!canFinalize}
          style={{ backgroundColor: canFinalize ? '#98BA21' : undefined }}
          className={cn(
            "w-full h-24 rounded-3xl flex items-center justify-center gap-4 border-b-[8px] transition-all transform relative overflow-hidden",
            canFinalize 
              ? "border-lime-900 text-slate-950 active:border-b-0 active:translate-y-2 cursor-pointer" 
              : "bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed opacity-40"
          )}
        >
          {isUploading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-slate-500 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xl font-bold uppercase tracking-wide text-slate-400">PROCESANDO...</span>
            </div>
          ) : (
            <span className="font-black text-3xl tracking-tight normal-case">Finalizar Pedido</span>
          )}
        </button>
      </div>
    </div>
  )
}
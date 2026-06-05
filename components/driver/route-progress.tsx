"use client"

import { Package, Clock, Route } from "lucide-react"

interface RouteProgressProps {
  completed: number
  total: number
  estimatedTime: number // in minutes
}

export function RouteProgress({ completed, total, estimatedTime }: RouteProgressProps) {
  const percentage = (completed / total) * 100
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Progreso de Ruta</span>
          <span className="text-sm font-bold text-accent">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{completed}/{total}</p>
            <p className="text-xs text-muted-foreground">Entregas</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{formatTime(estimatedTime)}</p>
            <p className="text-xs text-muted-foreground">Restante</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Route className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{total - completed}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

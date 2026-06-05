"use client"

import { Menu, Bell, Battery, Signal, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DriverHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-3.5" />
        </div>
      </div>
      
      {/* App header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <Menu className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">NodoNet</h1>
            <p className="text-xs text-muted-foreground">Repartidor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-success/10 px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">En linea</span>
          </div>
          <Button variant="ghost" size="icon" className="w-9 h-9 relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </Button>
        </div>
      </div>
    </header>
  )
}

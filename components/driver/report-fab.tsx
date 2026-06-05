"use client"

import { useState } from "react"
import { AlertCircle, X, Camera, Mic, MessageSquare, Package, MapPinOff, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const reportTypes = [
  {
    id: "not-home",
    icon: MapPinOff,
    label: "Cliente ausente",
    color: "text-warning"
  },
  {
    id: "wrong-address",
    icon: MapPinOff,
    label: "Direccion incorrecta",
    color: "text-destructive"
  },
  {
    id: "package-issue",
    icon: Package,
    label: "Problema con paquete",
    color: "text-destructive"
  },
  {
    id: "delay",
    icon: Clock,
    label: "Retraso en ruta",
    color: "text-warning"
  }
]

export function ReportFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // In real app, would handle voice recording
  }
  
  const handleCamera = () => {
    // In real app, would open camera
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-warning hover:bg-warning/90 text-warning-foreground shadow-lg shadow-warning/30 z-50"
        >
          <AlertCircle className="w-6 h-6" />
          <span className="sr-only">Reportar Novedad</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="bg-card border-t border-border rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground text-lg font-bold">Reportar Novedad</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 pb-6">
          {/* Report type selection */}
          <div className="grid grid-cols-2 gap-2">
            {reportTypes.map((type) => (
              <Button
                key={type.id}
                variant="outline"
                className={cn(
                  "h-auto py-4 flex flex-col items-center gap-2 border-2 transition-all",
                  selectedType === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedType(type.id)}
              >
                <type.icon className={cn("w-6 h-6", type.color)} />
                <span className="text-xs font-medium text-foreground">{type.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Media capture options */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className={cn(
                "flex-1 h-14",
                isRecording && "bg-destructive/20 border-destructive text-destructive"
              )}
              onClick={handleVoiceRecord}
            >
              <Mic className={cn("w-5 h-5 mr-2", isRecording && "animate-pulse")} />
              {isRecording ? "Grabando..." : "Nota de Voz"}
            </Button>
            
            <Button
              variant="secondary"
              className="flex-1 h-14"
              onClick={handleCamera}
            >
              <Camera className="w-5 h-5 mr-2" />
              Tomar Foto
            </Button>
          </div>
          
          {/* Submit button */}
          <Button
            size="lg"
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={!selectedType}
            onClick={() => {
              // In real app, would submit report
              setIsOpen(false)
              setSelectedType(null)
            }}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Enviar Reporte
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

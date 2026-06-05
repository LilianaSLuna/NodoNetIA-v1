"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OptimizeButtonProps {
  disabled?: boolean
  onOptimize: () => Promise<void>
}

export function OptimizeButton({ disabled, onOptimize }: OptimizeButtonProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleClick = async () => {
    setIsOptimizing(true)
    try {
      await onOptimize()
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isOptimizing}
      className={cn(
        "relative h-14 w-full overflow-hidden text-lg font-semibold",
        "bg-gradient-to-r from-accent via-accent to-primary",
        "hover:from-accent/90 hover:via-accent/90 hover:to-primary/90",
        "transition-all duration-300",
        "shadow-lg shadow-accent/25 hover:shadow-accent/40",
        "disabled:opacity-50 disabled:shadow-none"
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      
      <span className="relative flex items-center gap-3">
        {isOptimizing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Optimizando Ruta...
          </>
        ) : (
          <>
            <Sparkles className="h-6 w-6" />
            Optimizar Ruta de Enjambre
          </>
        )}
      </span>
    </Button>
  )
}

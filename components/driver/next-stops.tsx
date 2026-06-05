"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, MapPin, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DeliveryStop } from "@/lib/driver-mock-data"
import { cn } from "@/lib/utils"

interface NextStopsProps {
  stops: DeliveryStop[]
  currentIndex: number
}

export function NextStops({ stops, currentIndex }: NextStopsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const upcomingStops = stops.filter((_, index) => index > currentIndex)
  const completedStops = stops.filter((_, index) => index < currentIndex)
  
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="p-4 pb-0">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Siguientes Paradas</span>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {upcomingStops.length} restantes
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-3">
          <div className="space-y-2">
            {upcomingStops.map((stop, index) => (
              <div
                key={stop.id}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl transition-all",
                  index === 0 ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                )}
              >
                {/* Order number indicator */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {currentIndex + index + 2}
                </div>
                
                {/* Stop info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground truncate">{stop.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">{stop.address}</span>
                  </div>
                </div>
                
                {/* ETA */}
                <div className="flex items-center gap-1 bg-card px-2 py-1 rounded-lg shrink-0">
                  <Clock className="w-3 h-3 text-accent" />
                  <span className="text-xs font-semibold text-foreground">{stop.eta} min</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Completed section */}
          {completedStops.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-success">Completadas</span>
                <span className="text-xs text-muted-foreground bg-success/10 px-2 py-0.5 rounded-full">
                  {completedStops.length}
                </span>
              </div>
              <div className="space-y-1">
                {completedStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-2 p-2 rounded-lg opacity-60"
                  >
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{stop.customerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

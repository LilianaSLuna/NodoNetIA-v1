"use client"

import { Package, CheckCircle2, AlertTriangle, Route } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalOrders: number
  validatedOrders: number
  pendingOrders: number
}

export function StatsCards({ totalOrders, validatedOrders, pendingOrders }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Pedidos",
      value: totalOrders,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      label: "Validados",
      value: validatedOrders,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/20",
    },
    {
      label: "Por Revisar",
      value: pendingOrders,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/20",
    },
    {
      label: "Rutas Activas",
      value: 1,
      icon: Route,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

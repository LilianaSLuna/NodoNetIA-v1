"use client"

import { CheckCircle2, AlertTriangle, MapPin, Camera, FastForward, User } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Order {
  id: string
  address: string
  neighborhood: string
  isValidated: boolean
  lat: number
  lng: number
  statusOperativo?: string    // NUEVO: Para saber si está DELIVERED o SKIPPED
  evidence_url?: string | null // NUEVO: Link a la foto
  customer_name?: string      // NUEVO: Nombre del cliente
}

interface OrdersTableProps {
  orders: Order[]
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
}

export function OrdersTable({ orders, selectedOrderId, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-[100px]">ID Pedido</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Dirección</TableHead>
              <TableHead className="text-muted-foreground">Barrio</TableHead>
              <TableHead className="text-center text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  "cursor-pointer border-border transition-colors",
                  selectedOrderId === order.id ? "bg-primary/10" : "hover:bg-secondary/50",
                  order.statusOperativo === "DELIVERED" ? "bg-emerald-950/20" : "",
                  order.statusOperativo === "SKIPPED" ? "bg-red-950/20" : ""
                )}
              >
                <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                  {order.id.split('-').slice(0,2).join('-')} {/* Acorta el ID visualmente */}
                </TableCell>
                
                {/* COLUMNA DE CLIENTE */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">{order.customer_name || "Cliente Local"}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{order.address}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {order.neighborhood}
                  </Badge>
                </TableCell>
                
                {/* COLUMNA DE ESTADO CON EVIDENCIA */}
                <TableCell className="text-center">
                  {order.statusOperativo === "DELIVERED" ? (
                    <div className="flex flex-col items-center gap-1">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 border-none">Entregado</Badge>
                      {order.evidence_url && (
                        <a href={order.evidence_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                          <Camera className="h-3 w-3"/> Ver Evidencia
                        </a>
                      )}
                    </div>
                  ) : order.statusOperativo === "SKIPPED" ? (
                    <Badge variant="destructive" className="bg-red-900/80 border-red-800 text-red-300 flex items-center gap-1 mx-auto">
                      <FastForward className="h-3 w-3"/> Saltado
                    </Badge>
                  ) : order.isValidated ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-medium">Validada</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <span className="text-xs text-amber-500 font-medium">Revisar</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
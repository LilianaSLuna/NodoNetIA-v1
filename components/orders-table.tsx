"use client"

import { CheckCircle2, AlertTriangle, MapPin } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
              <TableHead className="text-muted-foreground">ID Pedido</TableHead>
              <TableHead className="text-muted-foreground">Direccion</TableHead>
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
                  selectedOrderId === order.id
                    ? "bg-primary/10"
                    : "hover:bg-secondary/50"
                )}
              >
                <TableCell className="font-mono text-sm font-medium text-foreground">
                  {order.id}
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
                <TableCell className="text-center">
                  {order.isValidated ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-xs text-success">Validada</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <span className="text-xs text-warning">Revisar</span>
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

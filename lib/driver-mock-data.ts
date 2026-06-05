export interface DeliveryStop {
  id: string
  orderId: string
  address: string
  neighborhood: string
  customerName: string
  phone: string
  eta: number // minutes from now
  lat: number
  lng: number
  status: "pending" | "current" | "completed"
  notes?: string
}

export const driverRoute: DeliveryStop[] = [
  {
    id: "STOP-001",
    orderId: "PED-001",
    address: "Cra 43A #14-109",
    neighborhood: "El Poblado",
    customerName: "Maria Gonzalez",
    phone: "+57 300 123 4567",
    eta: 0,
    lat: 6.2086,
    lng: -75.5695,
    status: "current",
    notes: "Edificio Torre del Rio, Apto 1501"
  },
  {
    id: "STOP-002",
    orderId: "PED-002",
    address: "Calle 10 #32-45",
    neighborhood: "Laureles",
    customerName: "Carlos Martinez",
    phone: "+57 301 234 5678",
    eta: 8,
    lat: 6.2455,
    lng: -75.5963,
    status: "pending"
  },
  {
    id: "STOP-003",
    orderId: "PED-003",
    address: "Av. El Poblado #8A-35",
    neighborhood: "Provenza",
    customerName: "Ana Rodriguez",
    phone: "+57 302 345 6789",
    eta: 15,
    lat: 6.2012,
    lng: -75.5672,
    status: "pending",
    notes: "Llamar al llegar"
  },
  {
    id: "STOP-004",
    orderId: "PED-005",
    address: "Calle 33 #65-78",
    neighborhood: "Belen",
    customerName: "Luis Hernandez",
    phone: "+57 303 456 7890",
    eta: 23,
    lat: 6.2312,
    lng: -75.5934,
    status: "pending"
  },
  {
    id: "STOP-005",
    orderId: "PED-007",
    address: "Calle 52 #49-112",
    neighborhood: "La Candelaria",
    customerName: "Sofia Perez",
    phone: "+57 304 567 8901",
    eta: 32,
    lat: 6.2512,
    lng: -75.5687,
    status: "pending",
    notes: "Centro Comercial, Local 234"
  },
  {
    id: "STOP-006",
    orderId: "PED-008",
    address: "Cra 80 #34A-15",
    neighborhood: "Robledo",
    customerName: "Diego Sanchez",
    phone: "+57 305 678 9012",
    eta: 41,
    lat: 6.2678,
    lng: -75.6012,
    status: "pending"
  },
  {
    id: "STOP-007",
    orderId: "PED-010",
    address: "Calle 44 #81-34",
    neighborhood: "Floresta",
    customerName: "Valentina Ruiz",
    phone: "+57 306 789 0123",
    eta: 50,
    lat: 6.2623,
    lng: -75.5845,
    status: "pending"
  }
]

// Calculate route coordinates for polyline
export const routeCoordinates = driverRoute.map(stop => ({
  lat: stop.lat,
  lng: stop.lng
}))

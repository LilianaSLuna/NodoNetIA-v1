import type { Order } from "@/components/orders-table"

export const mockOrders: Order[] = [
  {
    id: "PED-001",
    address: "Cra 43A #14-109",
    neighborhood: "El Poblado",
    isValidated: true,
    lat: 6.2086,
    lng: -75.5695,
  },
  {
    id: "PED-002",
    address: "Calle 10 #32-45",
    neighborhood: "Laureles",
    isValidated: true,
    lat: 6.2455,
    lng: -75.5963,
  },
  {
    id: "PED-003",
    address: "Av. El Poblado #8A-35",
    neighborhood: "Provenza",
    isValidated: true,
    lat: 6.2012,
    lng: -75.5672,
  },
  {
    id: "PED-004",
    address: "Cra 70 #44B-22",
    neighborhood: "Estadio",
    isValidated: false,
    lat: 6.2564,
    lng: -75.5878,
  },
  {
    id: "PED-005",
    address: "Calle 33 #65-78",
    neighborhood: "Belen",
    isValidated: true,
    lat: 6.2312,
    lng: -75.5934,
  },
  {
    id: "PED-006",
    address: "Cra 48 #10Sur-25",
    neighborhood: "La Visitacion",
    isValidated: false,
    lat: 6.2178,
    lng: -75.5789,
  },
  {
    id: "PED-007",
    address: "Calle 52 #49-112",
    neighborhood: "La Candelaria",
    isValidated: true,
    lat: 6.2512,
    lng: -75.5687,
  },
  {
    id: "PED-008",
    address: "Cra 80 #34A-15",
    neighborhood: "Robledo",
    isValidated: true,
    lat: 6.2678,
    lng: -75.6012,
  },
  {
    id: "PED-009",
    address: "Av. 33 #74-89",
    neighborhood: "San Javier",
    isValidated: false,
    lat: 6.2534,
    lng: -75.6123,
  },
  {
    id: "PED-010",
    address: "Calle 44 #81-34",
    neighborhood: "Floresta",
    isValidated: true,
    lat: 6.2623,
    lng: -75.5845,
  },
]

export function generateOrdersFromFile(): Order[] {
  // Simulate parsing file and returning orders
  return mockOrders
}

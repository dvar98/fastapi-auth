import { Timestamp } from "@angular/fire/firestore"

export default interface Gastos {
  id: number
  fecha: Timestamp
  concepto: string
  categoria: string
  cantidad: number
  valorUnitario: number
  total: number
}

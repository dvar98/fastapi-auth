export default interface Gastos {
  id?: number
  consecutivo: number
  fecha?: Date
  concepto: string
  categoria: string
  cantidad: number
  valorUnitario: number
  total: number
}

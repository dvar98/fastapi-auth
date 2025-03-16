import DetalleVenta from "./detalleVenta.interface"

export default interface Ventas {
  id?: number
  fecha?: Date
  consecutivo: number
  cliente: string
  productos: DetalleVenta[]
  totalVenta: number
}

// Compare this snippet from src/app/interfaces/detalleVenta.interface.ts:
// export default interface DetalleVenta {
//   tipo: 'c' | 'b' | 'a' | 'aa' | 'ex' | 'jum' | 'otro'
//   cantidad: number
//   valorUnitario: number
//   total: number
// }

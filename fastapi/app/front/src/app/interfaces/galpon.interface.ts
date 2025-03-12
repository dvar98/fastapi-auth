import Gastos from "./gastos.interface"
import Ventas from "./ventas.interface"
import inventario from "./inventario.interface"

export default interface Galpon {
  name: string
  ref: string
  consecutivoVentas: number
  consecutivoGastos: number
  ventasTotales?: number
  gastosTotales?: number
  ventas?: Ventas[]
  gastos?: Gastos[]
  inventario?: inventario[]
}

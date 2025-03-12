import Galpon from "./galpon.interface"

export default interface Granja {
  name: string
  path: string
  galpones?: Galpon[]
}

import Galpon from "./galpon.interface"

export default interface Granja {
  id: string
  name: string
  galpones: { [id: string]: Galpon }
}

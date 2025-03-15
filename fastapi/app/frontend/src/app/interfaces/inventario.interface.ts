import { Timestamp } from "@angular/fire/firestore";
import DetalleInventario from "./detalleInventario.interface";

export default interface inventario {
    fecha: Timestamp
    detalle: DetalleInventario[]
    TotalInventario: number
}
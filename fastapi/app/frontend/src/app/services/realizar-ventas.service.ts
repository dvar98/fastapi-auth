import { Injectable } from '@angular/core';
import Ventas from '../interfaces/ventas.interface';
import { GalponDataService } from './galpon-data.service';
import { GetDataFirebaseService } from './get-data-firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RealizarVentasService {

  constructor(
    private galponDataService: GalponDataService,
    private getDataFirebase: GetDataFirebaseService
  ) { }

  // Método para registrar una venta
  async registrarVenta(venta: Ventas) {
    let ventas = this.galponDataService.getGalpon().ventas;

    if (ventas) {
      ventas.push(venta);
    } else {
      this.galponDataService.getGalpon().ventas = [venta];
    }
    await this.updateVenta(venta);
  }

  // Realiza la ejecucion de los update para todos los documentos de ventas pendientes por subir. (No internet conection) - POR DESARROLLAR
  async updateVenta(venta: Ventas) {
    const galpon = this.galponDataService.getGalpon();
    galpon.consecutivoVentas++;
    const refColeccionGalpon = galpon.ref + '/ventas';
    await this.getDataFirebase.createDoc(refColeccionGalpon, venta, venta.id.toString());
    if (galpon.ventasTotales) {
      galpon.ventasTotales += venta.totalVenta;
    } else {
      galpon.ventasTotales = venta.totalVenta;
    }
    await this.getDataFirebase.updateDoc(galpon.ref, { ventasTotales: galpon.ventasTotales, consecutivoVentas: galpon.consecutivoVentas });
  }
}

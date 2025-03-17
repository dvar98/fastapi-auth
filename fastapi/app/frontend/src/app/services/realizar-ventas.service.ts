import { Injectable } from '@angular/core';
import Ventas from '../interfaces/ventas.interface';
import { GalponDataService } from './galpon-data.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RealizarVentasService {

  constructor(
    private galponDataService: GalponDataService,
    private http: HttpClient
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
    if (!galpon.consecutivoVentas) {
      galpon.consecutivoVentas = 0;
    }
    galpon.consecutivoVentas++;
    if (!galpon.ventasTotales) {
      galpon.ventasTotales = 0;
    }
    galpon.ventasTotales += venta.totalVenta;

    return this.http.post(`http://localhost:8000/galpones/${galpon.id}/ventas`, venta)
      .toPromise()
      .then((response: any) => {
        return response + this.updateGalpon(galpon);
      });
  }

  async updateGalpon(galpon: any) {
    return await this.http.put(`http://localhost:8000/galpones/${galpon.id}`, galpon)
      .toPromise()
      .then((response: any) => {
        return response;
      });
  }
}

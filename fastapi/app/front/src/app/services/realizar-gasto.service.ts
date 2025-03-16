import { Injectable } from '@angular/core';
import Gastos from '../interfaces/gastos.interface';
import { GalponDataService } from './galpon-data.service';
import { HttpClient } from '@angular/common/http';
import { UserAuthService } from './user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class RealizarGastoService {

  constructor(
    private authService: UserAuthService,
    private galponDataService: GalponDataService,
    private http: HttpClient
  ) { }

  async registrarGasto(gasto: Gastos) {
    let gastosGalpon = this.galponDataService.getGalpon().gastos;
    if (gastosGalpon) {
      gastosGalpon.push(gasto);
    } else {
      this.galponDataService.getGalpon().gastos = [gasto];
    }
    await this.updateGasto(gasto);
  }

  // Realiza la ejecución de los update para todos los documentos de ventas pendientes por subir. (No internet conection)
  async updateGasto(gasto: Gastos) {
    const galpon = this.galponDataService.getGalpon();
    if (!galpon.consecutivoGastos) {
      galpon.consecutivoGastos = 0;
    }
    galpon.consecutivoGastos++;
    if (!galpon.gastosTotales) {
      galpon.gastosTotales = 0;
    }
    galpon.gastosTotales += gasto.total;
    console.log('hola');


    return await this.http.post(`http://localhost:8000/galpones/${galpon.id}/gastos/create/`, gasto)
      .toPromise()
      .then((response: any) => {
        return response
      });
  }
}

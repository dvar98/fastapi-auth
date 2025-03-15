import { Injectable } from '@angular/core';
import Gastos from '../interfaces/gastos.interface';
import { GalponDataService } from './galpon-data.service';
import { GetDataFirebaseService } from './get-data-firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RealizarGastoService {

  constructor(
    private galponDataService: GalponDataService,
    private getDataFirebase: GetDataFirebaseService
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
    galpon.consecutivoGastos++;
    const refColeccionGalpon = galpon.ref + '/gastos';
    await this.getDataFirebase.createDoc(refColeccionGalpon, gasto, gasto.id.toString());
    if (galpon.gastosTotales) {
      galpon.gastosTotales += gasto.total;
    } else {
      galpon.gastosTotales = gasto.total;
    }
    await this.getDataFirebase.updateDoc(galpon.ref, { gastosTotales: galpon.gastosTotales, consecutivoGastos: galpon.consecutivoGastos });
  }
}

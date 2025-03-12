import { Injectable } from '@angular/core';
import { GetDataFirebaseService } from './get-data-firebase.service';
import { GranjaDataService } from './granja-data.service';
import Galpon from '../interfaces/galpon.interface';

@Injectable({
  providedIn: 'root'
})
export class GalponDataService {
  private galponSeleccionado: Galpon = { name: '', ref: '', consecutivoVentas: 0, consecutivoGastos: 0, ventas: [], gastos: [], inventario: [] };

  constructor(
    private granjaService: GranjaDataService,
    private getDataFirebase: GetDataFirebaseService) {
  }

  setIndexGalpon(index: number) {
    const galpones = this.granjaService.getGranjaSeleccionada().galpones //galpones de la granja seleccionada
    this.galponSeleccionado = galpones ? galpones[index] : { name: '', ref: '', consecutivoVentas: 0, consecutivoGastos: 0, ventas: [], gastos: [], inventario: [] };
  }

  async datosGalponSeleccionado() {
    // Ventas del galpón
    await this.getDataFirebase.getCollectionDocs(`${this.galponSeleccionado.ref}/ventas`).then(async (ventasGalpon: any[]) => {
      for (let i = 0; i < ventasGalpon.length; i++) {
        await this.getDataFirebase.getDocByReference(ventasGalpon[i].ref).then((venta) => {
          ventasGalpon[i] = {
            ...venta.data()
          }
        });
      }
      this.galponSeleccionado = {
        ...this.galponSeleccionado,
        ventas: ventasGalpon,
      }
    });

    // Gastos de cada galpón
    await this.getDataFirebase.getCollectionDocs(`${this.galponSeleccionado.ref}/gastos`).then(async (gastosGalpon: any[]) => {
      for (let i = 0; i < gastosGalpon.length; i++) {
        await this.getDataFirebase.getDocByReference(gastosGalpon[i].ref).then((gasto) => {
          gastosGalpon[i] = {
            ...gasto.data()
          }
        });
      }
      this.galponSeleccionado = {
        ...this.galponSeleccionado,
        gastos: gastosGalpon,
      }
    });
  }

  getGalpon(): Galpon {
    return this.galponSeleccionado;
  }
}

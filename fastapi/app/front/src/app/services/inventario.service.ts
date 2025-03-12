import { Injectable } from '@angular/core';
import inventario from '../interfaces/inventario.interface';
import { GetDataFirebaseService } from './get-data-firebase.service';
import { GalponDataService } from './galpon-data.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(
    private getDataFirebase: GetDataFirebaseService,
    private galponDataService: GalponDataService
  ) { }

  // Método para registrar un inventario
  async registrarInventario(inventario: inventario) {
    let inventario1 = this.galponDataService.getGalpon().inventario;
    if (inventario1) {
      inventario1.push(inventario);
    } else {
      this.galponDataService.getGalpon().inventario = [inventario];
    }
    await this.updateInventario(inventario);
  }

  // Realiza la ejecucion de los update para todos los documentos de inventario pendientes por subir. (No internet conection)
  async updateInventario(inventario: inventario) {
    const refColeccionGalpon = this.galponDataService.getGalpon().ref + '/inventario';
    await this.getDataFirebase.createDoc(refColeccionGalpon, inventario);
  }
}

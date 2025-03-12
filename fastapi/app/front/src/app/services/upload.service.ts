import { Injectable } from '@angular/core';
import { GetDataFirebaseService } from './get-data-firebase.service';
import Granja from '../interfaces/granja.interface';
import Galpon from '../interfaces/galpon.interface';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private getDataFirebase: GetDataFirebaseService
  ) { }

  async obtenerGranjas() {
    const response = await this.getDataFirebase.getCollectionDocs('granjas');
    let granjas: Granja[] = [];

    // Mapear cada documento a una promesa que se resuelve con una granja
    const granjasPromises = response.map(async (granja) => {
      const response = await this.getDataFirebase.getCollectionDocs(`${granja.ref.path}/galpones`);
      let galponesS: Galpon[] = [];
      response.forEach((galpon) => {
        const newGalpon: Galpon = {
          name: galpon.data().name,
          consecutivoVentas: 0,
          consecutivoGastos: 0,
          ref: galpon.ref.path
        }
        galponesS.push(newGalpon);
      });

      const newGranja: Granja = {
        name: granja.data().name,
        path: granja.ref.path,
        galpones: galponesS,
      }

      return newGranja;
    });

    // Esperar a que todas las promesas se resuelvan
    granjas = await Promise.all(granjasPromises);
    return granjas;
  }

  async obtenerGalpones(refGranja: string) {
    const response = await this.getDataFirebase.getCollectionDocs(`${refGranja}/galpones`);
    return response;
  }

  async create(ref: string, data: any) {
    const response = await this.getDataFirebase.createDoc(ref, data, data.id);
    return response;
  }

  async updateVenta(refGalpon: string, consecutivoVentas: number, totalVentas: number) {
    await this.getDataFirebase.updateDoc(refGalpon, { ventasTotales: totalVentas, consecutivoVentas: consecutivoVentas });
  }
  async updateGasto(refGalpon: string, consecutivoGastos: number, totalGastos: number) {
    await this.getDataFirebase.updateDoc(refGalpon, { gastosTotales: totalGastos, consecutivoGastos: consecutivoGastos });
  }
}

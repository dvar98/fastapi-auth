import { Injectable } from '@angular/core';
import { UserAuthService } from './user-auth.service';
import { DocumentReference } from '@angular/fire/firestore';
import { GetDataFirebaseService } from './get-data-firebase.service';
import Granja from '../interfaces/granja.interface';
import Galpon from '../interfaces/galpon.interface';

@Injectable({
  providedIn: 'root'
})

// Servicio que se encarga de manejar la información de las granjas
export class GranjaDataService {
  private granjasUser: Granja[] = [];
  private granjaSeleccionada: Granja = { name: '', path: '' };

  constructor(
    private userAuth: UserAuthService,
    private getDataFirebase: GetDataFirebaseService
  ) { }

  // Menu de granjas disponibles por usuario
  async setBasicGranjas() {
    const arrayGranjasRef: DocumentReference[] = this.userAuth.getUser().granjas;
    this.granjasUser = []; //Siempre que se vaya a llenar el arreglo, debe estar vacio.
    await arrayGranjasRef.forEach(async (granjaRef) => {
      await this.getDataFirebase.getDocByReference(granjaRef).then((granja) => {
        const newGranja: Granja = {
          name: granja.data().name,
          path: granjaRef.path
        };
        this.granjasUser.push(newGranja);
      });
    });
  }

  // Función que devuelve las granjas del usuario
  getGranjasUser(): Granja[] {
    return this.granjasUser;
  }

  // Menú de galpones disponibles por usuarios
  async setTotalInfoGranja(DocPathGranja: string) {
    await this.getDataFirebase.getCollectionDocs(`${DocPathGranja}/galpones`).then((galponesGranja) => {

      // Se agrega la referencia del documento para cada galpon presente en la colección para poder acceder a la información de cada galpón.
      for (let i = 0; i < galponesGranja.length; i++) {
        galponesGranja[i] = {
          ...galponesGranja[i].data(),
          ref: galponesGranja[i].ref.path
        };
      }

      // Se actualiza la granja seleccionada con la información de sus galpones
      this.granjaSeleccionada = {
        ...this.granjaSeleccionada,
        galpones: galponesGranja
      };
    });
  }

  // Función que devuelve la granja seleccionada
  getGranjaSeleccionada(): Granja {
    return this.granjaSeleccionada;
  }

  // Función que actualiza la granja seleccionada
  actualizarGranjaSeleccionada(granja: number) {
    this.granjaSeleccionada = this.granjasUser[granja];
  }

  // Función que crea una granja
  async crearGranja(nombre: string) {
    // transformar nombre para asignarle un id
    const id = nombre.toLowerCase().replace(/ /g, '-');
    return await this.getDataFirebase.createDoc('granjas/', { name: nombre }, id).then(async (docRef: any) => {
      await this.userAuth.addGranjaToUser(docRef); // Agrega la granja al usuario
      this.setBasicGranjas(); // Vuelve a descargar la información de las granjas
      return true;
    }).catch(() => {
      return false;
    });
  }

  // Funcion que elimina una granja
  async eliminarGranja(index: number) {
    const granja = this.granjasUser[index];
    await this.getDataFirebase.deleteDoc(granja.path).then(async (docRef: any) => {
      if (docRef) {
        await this.userAuth.deleteGranja(docRef).then(() => {
          this.setBasicGranjas();
        }).catch(() => {
          alert
            ('Error al eliminar la granja');
        });
      }
    });
  }

  // Función que crea un galpón
  async crearGalpon(nombre: string) {
    const id = nombre.toLowerCase().replace(/ /g, '-');
    const galpon = {
      name: nombre,
      consecutivoVentas: 0,
      consecutivoGastos: 0,
    }

    const granjaPath = this.granjaSeleccionada.path;
    return await this.getDataFirebase.createDoc(`${granjaPath}/galpones`, galpon, id).then(async () => {
      await this.setTotalInfoGranja(granjaPath);
      return true;
    });
  }

  //Función que elimina un galpón
  async eliminarGalpon(index: number) {
    const granjaPath = this.granjaSeleccionada.path;
    if (this.granjaSeleccionada.galpones) {
      const galponPath = this.granjaSeleccionada.galpones[index].ref;
      return await this.getDataFirebase.deleteDoc(galponPath).then(async () => {
        await this.setTotalInfoGranja(granjaPath);
        return true;
      });
    } else {
      alert('No existen galpones disponibles');
      return false;
    }
  }

  // Función para obtener las granjas
  getGranjas() {
    return this.getDataFirebase.getCollectionDocs('granjas');
  }

}

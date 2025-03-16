import { Injectable } from '@angular/core';
import { UserAuthService } from './user-auth.service';
import Granja from '../interfaces/granja.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

// Servicio que se encarga de manejar la información de las granjas
export class GranjaDataService {
  private granjasUser: { [id: string]: Granja } = {};
  private granjaSeleccionada: Granja = { id: "", name: '', galpones: {} };

  constructor(
    private userAuth: UserAuthService,
    private http: HttpClient
  ) { }

  // Menu de granjas disponibles por usuario
  async setBasicGranjas() {
    this.granjasUser = {};

    // Se obtiene el id del usuario
    const user_id = this.userAuth.getUser().id;
    this.http.get(`http://localhost:8000/${user_id}/granjas/`)
      .toPromise()
      .then((response: any) => {
        response.forEach((granja: any) => {
          this.granjasUser[granja.id] = {
            id: granja.id,
            name: granja.name,
            galpones: {},
          };
        });
      });
  }

  // Función que devuelve las granjas del usuario
  getGranjasUser(): { [id: string]: Granja } {
    return this.granjasUser;
  }

  // Menú de galpones disponibles por usuarios
  async setTotalInfoGranja(id_granja: string) {
    await this.http.get(`http://localhost:8000/${id_granja}/galpones/`)
      .toPromise()
      .then((response: any) => {
        response.forEach((galpon: any) => {
          this.granjasUser[id_granja].galpones[galpon.id] = { id: galpon.id, name: galpon.name };
        });
      });

    // Se actualiza la granja seleccionada
    this.granjaSeleccionada = this.granjasUser[id_granja];
    return this.granjaSeleccionada;
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
  async crearGranja(name: string) {
    const id = name.toLowerCase().replace(/ /g, '-');
    return await this.http.post(`http://localhost:8000/${this.userAuth.getUser().id}/granjas/create/`, { name: name })
      .toPromise()
      .then((response: any) => {
        this.setBasicGranjas(); // Vuelve a descargar la información de las granjas
        return true;
      })
      .catch((error: any) => {
        return error;
      });
  }

  // Funcion que elimina una granja
  async eliminarGranja(id: string) {
    return await this.http.delete(`http://localhost:8000/granjas/${id}/`)
      .toPromise()
      .then(() => {
        this.setBasicGranjas(); // Vuelve a descargar la información de las granjas
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  // Función que crea un galpón
  async crearGalpon(name: string) {
    return await this.http.post(`http://localhost:8000/${this.granjaSeleccionada.id}/galpones/create/`, { name: name })
      .toPromise()
      .then(() => {
        this.setBasicGranjas();
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  //Función que elimina un galpón
  async eliminarGalpon(index: number) {
    if (this.granjaSeleccionada.galpones) {
      const id: string = Object.keys(this.granjaSeleccionada.galpones)[index];
      return await this.http.delete(`http://localhost:8000/galpones/${id}/`)
    } else {
      alert('No existen galpones disponibles');
      return false;
    }
  }

  // Función para obtener las granjas
  getGranjas() {
    return this.granjasUser;
  }
}

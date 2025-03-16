import { Injectable } from '@angular/core';
import { GranjaDataService } from './granja-data.service';
import Galpon from '../interfaces/galpon.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GalponDataService {
  private galponSeleccionado: Galpon = { id: '', name: '' };

  constructor(
    private granjaService: GranjaDataService,
    private http: HttpClient
  ) { }

  setIndexGalpon(id: string) {
    const galpones = this.granjaService.getGranjaSeleccionada().galpones //galpones de la granja seleccionada
    this.galponSeleccionado = galpones ? galpones[id] : { name: '', id: '' };
  }

  async basicDataGalponSeleccionado() {
    return this.http.get(`http://localhost:8000/galpones/${this.galponSeleccionado.id} `)
      .toPromise()
      .then((response: any) => {
        this.galponSeleccionado = response as Galpon;
      });
  }

  async ventasGalpon(offset: number, limit: number) {
    return this.http.get(`http://localhost:8000/galpones/${this.galponSeleccionado.id}/ventas?offset=${offset}&limit=${limit}`)
      .toPromise()
      .then((response: any) => {
        return response;
      });
  }

  async gastosGalpon(offset: number, limit: number) {
    return this.http.get(`http://localhost:8000/galpones/${this.galponSeleccionado.id}/gastos?offset=${offset}&limit=${limit}`)
      .toPromise()
      .then((response: any) => {
        return response;
      });
  }

  getGalpon(): Galpon {
    return this.galponSeleccionado;
  }
}

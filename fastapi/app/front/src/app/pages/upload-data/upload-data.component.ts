import { Component, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { LogarithmicScale } from 'chart.js';
import Galpon from 'src/app/interfaces/galpon.interface';
import Gastos from 'src/app/interfaces/gastos.interface';
import Granja from 'src/app/interfaces/granja.interface';
import Ventas from 'src/app/interfaces/ventas.interface';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrl: './upload-data.component.scss'
})
export class UploadDataComponent implements OnInit {
  granjas: Granja[] = [];
  granjaSeleccionada: Granja = { name: '', path: '' }

  galpones: Galpon[] = [];
  galponSeleccionado: Galpon = { name: '', consecutivoVentas: 0, consecutivoGastos: 0, ref: '' }

  chargeIcon: boolean = false;

  constructor(
    private uploadService: UploadService,
  ) { }

  async ngOnInit() {
    await this.uploadService.obtenerGranjas().then((response) => {
      this.granjas = response;
      this.granjaSeleccionada = this.granjas[0];
      if (this.granjaSeleccionada.galpones) {
        this.galpones = this.granjaSeleccionada.galpones;
        this.galponSeleccionado = this.granjaSeleccionada.galpones[0];
      }
    });
  }

  changeGranja(event: Event) {
    this.galpones = [];
    this.galponSeleccionado = { name: '', consecutivoVentas: 0, consecutivoGastos: 0, ref: '' };
    const htmlElement = (event.target as HTMLInputElement);
    this.granjaSeleccionada = this.granjas[Number(htmlElement.value)];

    this.uploadService.obtenerGalpones(this.granjaSeleccionada.path).then((galpones) => {
      galpones.forEach((galpon) => {
        this.galpones.push(galpon.data())
      })
      if (this.granjaSeleccionada.galpones) {
        this.galpones = this.granjaSeleccionada.galpones;
        this.galponSeleccionado = this.granjaSeleccionada.galpones[0];
      }
    })
  }

  changeGalpon(event: Event) {
    const htmlElement = (event.target as HTMLInputElement);
    this.galponSeleccionado = this.galpones[Number(htmlElement.value)];
  }

  public importedData: Array<any> = [];
  importCsv: any[] = [];

  isDisabledVentas: boolean = true;
  isDisabledGastos: boolean = true;
  isDisabledInventario: boolean = true;

  async setUserTable(fecha: string, userTable: any, key: string) {
    try {
      return await this.define(
        fecha,
        userTable,
        key, //key para atributo del documento a actulizar segun año y mes
      )
    } catch (error) {
      console.error('Error:', error);
      // Manejar el error si ocurre alguna excepción durante el proceso
      return 0;
    }
  }

  firstIteration: boolean = true;

  key: string = '';
  fecha: string = '';
  totalVenta: number = 0;


  filasTables: any[] = [];

  async define(fecha: string, detalleItem: any, key: string): Promise<number> {
    let actualizados = 0;
    this.key = key;

    if (this.fecha !== fecha || this.firstIteration) {
      if (!this.firstIteration) {
        await this.recorridoFilas(this.fecha);
        this.totalVenta = 0;
        actualizados = 1;
      }
      this.firstIteration = false;

      this.fecha = fecha;
      this.filasTables = [];
      this.totalVenta += detalleItem.valorTotal;
      this.filasTables.push(detalleItem);

      return actualizados;
    } else {
      this.totalVenta += detalleItem.valorTotal;
      this.filasTables.push(detalleItem);
      return actualizados;
    }
  }

  sumaVentas: number = 0;

  async recorridoFilas(fecha: string) {
    let detalle = this.filasTables;
    let fechaParts = fecha.split('/');
    let fechaGasto = new Date(Number(fechaParts[2]), Number(fechaParts[1]) - 1, Number(fechaParts[0]));

    let venta: Ventas = {
      id: this.galponSeleccionado.consecutivoVentas + 1,
      fecha: Timestamp.fromDate(fechaGasto),
      cliente: 'None',
      detalle: detalle,
      totalVenta: this.totalVenta
    }

    this.galponSeleccionado.consecutivoVentas++;
    this.sumaVentas += venta.totalVenta;

    await this.uploadService.create(`${this.galponSeleccionado.ref}/ventas`, venta);
  }

  async uploadVentas() {
    for (const venta of this.importedData) {
      const response = await this.setUserTable(
        venta['FECHA'],
        {
          tipo: venta['DETALLE'],
          cantidad: Number(venta['CANTIDAD']),
          valorUnitario: Number(venta['VALOR UNITARIO']),
          valorTotal: Number(venta['VALOR TOTAL']),
        },
        'ventas'//key
      );
    }
    this.chargeIcon = true;

    await this.uploadService.updateVenta(this.galponSeleccionado.ref, this.galponSeleccionado.consecutivoVentas, this.sumaVentas);
    this.chargeIcon = false;
    alert('Ventas subidas correctamente');
  }
  async uploadGastos() {
    this.chargeIcon = true;
    let sumaGastos = 0;
    for (const gasto of this.importedData) {
      let fechaParts = gasto['FECHA'].split('/');
      let fechaGasto = new Date(Number(fechaParts[2]), Number(fechaParts[1]) - 1, Number(fechaParts[0]));
      let newGasto: Gastos = {
        id: this.galponSeleccionado.consecutivoGastos + 1,
        fecha: Timestamp.fromDate(fechaGasto),
        concepto: gasto['CONCEPTO'],
        categoria: gasto['CATEGORIA'],
        cantidad: Number(gasto['CANTIDAD']),
        valorUnitario: Number(gasto['VALOR UNITARIO']),
        total: Number(gasto['VALOR TOTAL']),
      }
      this.galponSeleccionado.consecutivoGastos++;
      sumaGastos += newGasto.total;
      await this.uploadService.create(`${this.galponSeleccionado.ref}/gastos`, newGasto);
    }
    await this.uploadService.updateGasto(this.galponSeleccionado.ref, this.galponSeleccionado.consecutivoGastos, sumaGastos);
    this.chargeIcon = false;
    alert('Ventas subidas correctamente');
  }

  public async importDataFromCSV(event: any, separator: string, isFrom: string) {
    let fileContent = await this.getTextFromFile(event);
    this.importedData = this.interpretateCsv(fileContent, separator);
    // Control UI para el numero de filas detectadas`
    switch (isFrom) {
      case 'ventas':
        this.isDisabledVentas = false;
        this.isDisabledGastos = true;
        break;
      case 'gastos':
        this.isDisabledGastos = false;
        this.isDisabledVentas = true;
        break;
      case 'inventario':
        this.isDisabledInventario = false;
        this.isDisabledVentas = true;
        this.isDisabledGastos = true;
        break;
      default:
        break;
    }
  }

  private async getTextFromFile(event: any) {
    const file: File = event.target.files[0];
    let fileContent = await file.text();

    return fileContent;
  }

  interpretateCsv(csvText: string, separator: string) {
    const propertyNames = csvText.slice(0, csvText.indexOf('\n')).split(separator);
    const dataRows = csvText.slice(csvText.indexOf('\n') + 1).split('\n');

    let dataArray: any[] = [];
    dataRows.forEach((row) => {
      // Eliminar el carácter \r si está presente
      row = row.replace(/\r/g, '');

      let values = row.split(separator);

      let obj: any = new Object();

      for (let index = 0; index < propertyNames.length; index++) {
        const propertyName: string = propertyNames[index];

        let val: any = values[index];
        if (val === '') {
          val = null;
          break;
        } else {
          obj[propertyName] = val;
        }
      }
      dataArray.push(obj);
    })

    return dataArray;
  }
}

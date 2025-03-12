import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from 'src/app/services/inventario.service';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/services/user-auth.service';
import inventario from 'src/app/interfaces/inventario.interface';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})

export class InventarioComponent implements OnInit {
  constructor(
    private authService: UserAuthService,
    private router: Router,
    private inventarioService: InventarioService
  ) { }


  async ngOnInit() {
    await this.authService.verifyUser().then((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/']);
      }
    })
  }

  inventario: inventario = {
    fecha: Timestamp.now(),
    detalle: [],
    TotalInventario: 0
  }



  async crearInventario() {
    // Restablecer el inventario
    this.inventario.detalle = [];
    this.inventario.TotalInventario = 0;

    for (const k of this.getKeysObject(this.filas)) {
      if (this.filas[k].cantidad() !== undefined && this.filas[k].total() !== undefined) {
        this.inventario.detalle.push({
          tipo: k,
          cantidad: this.filas[k].cantidad(),
          TotalInventario: this.filas[k].total()
        });
      } else if (this.filas[k].cantidad() === '' || this.filas[k].total() === '') {
        alert(`Por favor complete todos los campos de la fila del producto tipo ${k}`);
        return;
      }
    }

    // Introduce un retraso de 2 segundos (2000 milisegundos) antes de registrar el inventario
    setTimeout(async () => {
      await this.inventarioService.registrarInventario(this.inventario);
      alert('Inventario registrado con éxito');
      this.arrowBack();
    }, 2000);
  }

  filas: {
    [key: string]: { cantidad: any, valorUnitario: any, total: any }
  } = {
      'C': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'B': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'A': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'AA': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'EX': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'JUM': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      },
      'OTRO': {
        cantidad: signal(0),
        valorUnitario: signal(0),
        total: signal(0)
      }
    };

  //funcion para obtener las llaves de cualquier objeto
  getKeysObject(obj: {}) {
    return Object.keys(obj);
  }

  //funcion para cambiar cantidad
  changeCantidad(key: string, event: Event) {
    const htmlElement = (event.target as HTMLInputElement);
    let value = htmlElement.value;

    this.filas[key].cantidad.set(value);
    this.calcularTotal(key);
  }

  calcularTotal(key: string) {
    const total = Number(this.filas[key].cantidad());
    this.filas[key].total.set(total);

    // sumar el total de todas las filas
    this.inventario.TotalInventario = 0;
    for (const k of this.getKeysObject(this.filas)) {
      const filaTotal = Number(this.filas[k].total());
      if (!isNaN(filaTotal)) {
        this.inventario.TotalInventario += filaTotal;
      }
    }
  }

  //funcion para cambiar valor unitario
  changeValorUnitario(key: string, event: Event) {
    const htmlElement = (event.target as HTMLInputElement);
    let value = htmlElement.value;

    this.filas[key].valorUnitario.set(value);
    this.calcularTotal(key);
  }

  arrowBack() {
    window.history.back()
  }
}

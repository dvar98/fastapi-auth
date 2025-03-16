import { formatCurrency } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Gastos from 'src/app/interfaces/gastos.interface';
import { GalponDataService } from 'src/app/services/galpon-data.service';
import { GranjaDataService } from 'src/app/services/granja-data.service';
import { RealizarGastoService } from 'src/app/services/realizar-gasto.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss']
})
export class GastosComponent implements OnInit {
  constructor(
    private authService: UserAuthService,
    private router: Router,
    private gastoService: RealizarGastoService,
    private granjaService: GranjaDataService,
    private galponService: GalponDataService,
  ) { }

  consecutivoGastos: number = 0;

  path: { name: string, path: string }[] = [];

  async ngOnInit() {
    await this.authService.verifyUser().then((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/']);
      }
    })

    const refGranja = this.granjaService.getGranjaSeleccionada().name;
    const refGalpon = this.galponService.getGalpon().name;
    if (refGranja && refGalpon) {
      this.path = [
        { name: 'granjas', path: 'menu-granjas' },
        { name: refGranja, path: 'vista-general-granjas' },
        { name: 'galpones', path: 'vista-general-granjas' },
        { name: refGalpon, path: 'vista-general-granjas' },
        { name: 'gastos', path: 'gastos' }
      ];
    }

    this.consecutivoGastos = this.galponService.getGalpon().consecutivoGastos ?? 0;
  }

  gasto: Gastos = {
    consecutivo: 0,
    concepto: '',
    categoria: '',
    cantidad: 0,
    valorUnitario: 0,
    total: 0
  }

  async crearGasto() {
    //verificar que todos los atributos de gasto esten completos
    if (this.gasto.cantidad == 0 || this.gasto.valorUnitario == 0 || this.gasto.concepto == '' || this.gasto.categoria == '') {
      alert('Por favor complete todos los campos');
      return;
    }

    this.gasto.consecutivo = this.consecutivoGastos;
    await this.gastoService.registrarGasto(this.gasto);
    alert('Gasto registrada con éxito');
    this.arrowBack();
  }

  //generar funciones para setear el concepto y la categoria
  setConcepto(event: Event) {
    const concepto = (event.target as HTMLInputElement).value;
    this.gasto.concepto = concepto;
  }

  setCategoria(event: Event) {
    const categoria = (event.target as HTMLInputElement).value;
    this.gasto.categoria = categoria;
  }

  //funcion para cambiar cantidad
  changeCantidad(event: Event) {
    const htmlElement = (event.target as HTMLInputElement);
    let value = htmlElement.value.replaceAll('$', '');
    value = value.replaceAll(',', '');

    this.gasto.cantidad = parseInt(value);
    this.calcularTotal();
  }

  //funcion para cambiar valor unitario
  changeValorUnitario(event: Event) {
    const htmlElement = (event.target as HTMLInputElement);
    let value = htmlElement.value.replaceAll('$', '');
    value = value.replaceAll(',', '');

    this.gasto.valorUnitario = parseInt(value);
    this.calcularTotal();
  }

  //funcion para calcular el total
  calcularTotal() {
    const total = this.gasto.cantidad * this.gasto.valorUnitario;
    this.gasto.total = total;
  }

  //funcion para dar formato a la moneda
  formatCurrency(event: any) {
    let input = parseFloat(event.target.value.replace(/[^0-9.]/g, ''));
    if (!isNaN(input)) {
      event.target.value = formatCurrency(input, 'en', '$', 'USD', '1.0-0');
    } else {
      event.target.value = '$';
    }
  }

  moneyFormat(money: number) {
    return money.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  arrowBack() {
    window.history.back()
  }
}

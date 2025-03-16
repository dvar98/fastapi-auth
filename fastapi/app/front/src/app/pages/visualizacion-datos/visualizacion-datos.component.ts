import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { GalponDataService } from 'src/app/services/galpon-data.service';
import { GranjaDataService } from 'src/app/services/granja-data.service';
import Galpon from 'src/app/interfaces/galpon.interface';
import { UserAuthService } from 'src/app/services/user-auth.service';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import Gastos from 'src/app/interfaces/gastos.interface';
import Ventas from 'src/app/interfaces/ventas.interface';
Chart.register(...registerables);

import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-visualizacion-datos',
  templateUrl: './visualizacion-datos.component.html',
  styleUrls: ['./visualizacion-datos.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  animations: [
    trigger('fadeInOutFastWidth', [
      transition(':enter', [
        style({ opacity: 0, width: 0 }),
        animate('0.5s linear', style({ opacity: 1, width: '*' })) // '*' indica que se usará la altura actual
      ]),
      transition(':leave', [
        animate('0.5s linear', style({ opacity: 0, width: 0 }))
      ])
    ]),
  ],
})
export class VisualizacionDatosComponent implements OnInit {
  granjaSeleccionada: any = { name: '', path: '' };
  galpon: Galpon = { id: '', name: '', consecutivoVentas: 0, consecutivoGastos: 0, ventasTotales: 0, gastosTotales: 0, ventas: [], gastos: [] };
  ventasGalpon: Ventas[] = [];
  gastosGalpon: Gastos[] = [];

  ventasFiltradas: Ventas[][] = [];
  gastosFiltrados: Gastos[][] = [];

  path: { name: string, path: string }[] = [];

  mostrarVentas: boolean = true;
  mostrarGastos: boolean = false;
  mostrarGraficas: boolean = false;
  mostrarUtilidades: boolean = false;

  // Miguel
  showVentasFilter: boolean = false;
  showVentasOrder: boolean = false;
  showGastosFilter: boolean = false;
  showGastosOrder: boolean = false;
  filtroVentas: string = '';
  ordenVentas: string = 'normal';
  filtroGastos: string = '';
  ordenGastos: string = 'normal';
  mostrarInputFechaFlag: boolean = false;
  datosFiltrados: any = {};
  datosFiltrados2: any = {};

  intervaloSeleccionado: string = 'por_cliente';

  ventasChart: Chart | null = null;
  gastosChart: Chart<'pie', number[], string> | null = null;
  lineChart: Chart | null = null;
  utilidadChart: Chart | null = null;

  chargeIco: boolean = false;

  // Index to keep track of current chart being displayed
  currentChartIndex: number = 0;

  chartTitles: string[] = ['Ventas', 'Gastos', 'Ventas vs Gastos', 'Utilidad'];

  startDate: string = '';
  endDate: string = '';

  constructor(
    private authService: UserAuthService,
    private granjaService: GranjaDataService,
    private galponService: GalponDataService,
    private router: Router
  ) { }

  ventasGalponGrupo: Ventas[][] = [];
  currentPageVentas: number = 0;
  gastosGalponGrupo: Gastos[][] = [];
  currentPageGastos: number = 0;

  changePage(currentPage: number, cambio: number, length: number) {
    currentPage += cambio;
    if (currentPage < 0) {
      currentPage = length - 1;
    }

    if (currentPage >= length) {
      currentPage = 0;
    }
    return currentPage;
  }

  async ngOnInit() {
    await this.authService.verifyUser().then(async (isLogged) => {
      if (!isLogged) {
        // this.router.navigate(['/']);
      } else {
        const refGranja = this.granjaService.getGranjaSeleccionada().name;
        const refGalpon = this.galponService.getGalpon().name;
        if (refGranja && refGalpon) {
          this.path = [
            { name: 'granjas', path: 'menu-granjas' },
            { name: refGranja, path: 'vista-general-granja' },
            { name: refGalpon, path: 'menu-seleccion-galpon' },
            { name: 'visualización-datos', path: 'visualizacion-datos' }
          ];
        }

        this.granjaSeleccionada = this.granjaService.getGranjaSeleccionada();

        this.chargeIco = true;
        // Descargar los datos del galpón seleccionado
        await this.galponService.basicDataGalponSeleccionado();
        await this.galponService.ventasGalpon(0, 10);
        await this.galponService.gastosGalpon(0, 10).then((gastos) => {
          this.gastosGalpon = gastos;
        });
        this.galpon = this.galponService.getGalpon();

        // Ventas
        this.ventasGalpon = this.galpon?.ventas ?? [];
        // organizar ventasGalpon por fecha
        this.ventasGalpon.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

        // Dividir en grupos de 5
        for (let i = 0; i < this.ventasGalpon.length; i += 5) {
          let grupo = this.ventasGalpon.slice(i, i + 5);
          this.ventasGalponGrupo.push(grupo);
        }

        // this.gastosGalpon = this.galpon?.gastos ?? [];
        // organizar gastosGalpon por fecha
        this.gastosGalpon.sort((a, b) => a.fecha && b.fecha ? a.fecha.getTime() - b.fecha.getTime() : 0);

        // dividir en grupos de 5
        for (let i = 0; i < this.gastosGalpon.length; i += 5) {
          let grupo = this.gastosGalpon.slice(i, i + 5);
          this.gastosGalponGrupo.push(grupo);
        }

        this.chargeIco = false;

        // Inicializar las variables filtradas con los datos originales
        this.ventasFiltradas = [...this.ventasGalponGrupo];
        this.gastosFiltrados = [...this.gastosGalponGrupo];
      }
    });
  }

  arrowBack() {
    window.history.back();
  }

  moneyFormat(money: number) {
    return money.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  cambiarIntervalo(event: Event) {
    const target = event.target as HTMLSelectElement;
    const valor = target.value;
    if (valor) {
      this.intervaloSeleccionado = valor;
      this.renderChart();
    } else {
      console.error('Intervalo de tiempo no seleccionado.');
    }
  }

  renderChart() {
    const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Destruir gráficas previas si existen
        if (this.ventasChart) {
          this.ventasChart.destroy();
          this.ventasChart = null;
        }
        if (this.gastosChart) {
          this.gastosChart.destroy();
          this.gastosChart = null;
        }
        if (this.lineChart) {
          this.lineChart.destroy();
          this.lineChart = null;
        }
        if (this.utilidadChart) {
          this.utilidadChart.destroy();
          this.utilidadChart = null;
        }

        // Renderizar la gráfica correspondiente utilizando if-else
        if (this.currentChartIndex === 0) {
          this.loadVentasChart(context);
        } else if (this.currentChartIndex === 1) {
          this.loadGastosChart(context);
        } else if (this.currentChartIndex === 2) {
          this.loadLineChart(context);
        } else if (this.currentChartIndex === 3) {
          this.loadUtilidadChart(context);
        } else {
          console.error("Índice de gráfica desconocido");
        }
      }
    }
  }


  prevChart() {
    this.currentChartIndex = (this.currentChartIndex - 1 + this.chartTitles.length) % this.chartTitles.length;
    this.renderChart();
  }

  nextChart() {
    this.currentChartIndex = (this.currentChartIndex + 1) % this.chartTitles.length;
    this.renderChart();
  }

  loadVentasChart(context: CanvasRenderingContext2D) {
    if (this.ventasChart) {
      this.ventasChart.destroy();
    }

    let agrupado = this.agruparDatos(this.galpon.ventas ?? [], this.intervaloSeleccionado);
    let labels = this.intervaloSeleccionado === 'por_cliente' ? agrupado.map(group => group.cliente) :
      this.intervaloSeleccionado === 'por_tipo' ? agrupado.map(group => group.tipo) :
        agrupado.map(group => group.fecha);
    let data = this.intervaloSeleccionado === 'por_tipo' ? agrupado.map(group => group.cantidad) :
      agrupado.map(group => group.totalVenta);
    let labelDescriptor = this.intervaloSeleccionado === 'por_cliente' ? 'Ventas por Cliente' :
      this.intervaloSeleccionado === 'por_tipo' ? 'Cantidad de Ventas por Tipo de Huevo' :
        'Ventas por Fecha';

    const chartData = {
      labels: labels,
      datasets: [{
        label: labelDescriptor,
        data: data,
        backgroundColor: '#002D4E',
        borderColor: '#002D4E',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: '#ffffff',
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: '#ffffff',
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
            }
          }
        }
      }
    };

    this.ventasChart = new Chart(context, config);
  }

  loadGastosChart(context: CanvasRenderingContext2D) {
    if (this.gastosChart) {
      this.gastosChart.destroy();
    }

    const gastosAgrupados = this.agruparGastosPorConcepto();
    const totalGastos = gastosAgrupados.reduce((sum, current) => sum + current.total, 0);
    const labels = gastosAgrupados.map(g => `${g.categoria} (${((g.total / totalGastos) * 100).toFixed(0)}%)`);
    const data = gastosAgrupados.map(g => g.total);

    const chartData = {
      labels: labels,
      datasets: [{
        label: 'Gastos por Categoria',
        data: data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'
        ]
      }]
    };

    const config: ChartConfiguration<'pie', number[], string> = {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#F8F8FF'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
        }
      }
    };

    this.gastosChart = new Chart<'pie', number[], string>(context, config);
  }

  loadLineChart(context: CanvasRenderingContext2D) {
    if (!this.galpon || !this.galpon.ventas || !this.galpon.gastos) {
      console.error("Datos de ventas o gastos no disponibles.");
      return;
    }

    const ventas = this.galpon.ventas ?? [];
    const gastos = this.galpon.gastos ?? [];

    const fechasVentas = ventas.map(v => v.fecha ? v.fecha.getTime() : 0).filter(time => time !== 0);
    const fechasGastos = gastos.map(g => g.fecha ? g.fecha.getTime() : 0).filter(time => time !== 0);
    const todasLasFechas = [...new Set([...fechasVentas, ...fechasGastos])].sort((a, b) => a - b);

    const fechasFormato = todasLasFechas.map(ms => new Date(ms).toLocaleDateString('es'));

    const ventasData = todasLasFechas.map(date => {
      const total = ventas.filter(v => v.fecha && v.fecha.getTime() === date)
        .reduce((sum, curr) => sum + curr.totalVenta, 0);
      return total;
    });

    const gastosData = todasLasFechas.map(date => {
      const total = gastos.filter(g => g.fecha && g.fecha.getTime() === date)
        .reduce((sum, curr) => sum + curr.total, 0);
      return total;
    });

    const chartData = {
      labels: fechasFormato,
      datasets: [
        {
          label: 'Gastos',
          data: gastosData,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Ventas',
          data: ventasData,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
            }
          },
          tooltip: {
            callbacks: {
              labelColor: function (context) {
                return {
                  borderColor: 'rgba(0, 0, 0, 0)',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 2,
                  borderDash: [2, 2],
                  borderRadius: 2,
                };
              },
              labelTextColor: function () {
                return 'rgba(255, 255, 255, 0.8)';
              }
            }
          }
        }
      }
    };

    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChart = new Chart(context, config);
  }

  loadUtilidadChart(context: CanvasRenderingContext2D) {
    if (this.utilidadChart) {
      this.utilidadChart.destroy();
    }

    const fechasVentas = this.galpon.ventas?.map(v => v.fecha ? v.fecha.getTime() : 0) ?? [];
    const fechasGastos = this.galpon.gastos?.map(g => g.fecha ? g.fecha.getTime() : 0) ?? [];
    const todasLasFechas = [...new Set([...(fechasVentas || []), ...(fechasGastos || [])])].sort((a, b) => a - b);

    const utilidadData = todasLasFechas.map(date => {
      const totalVentas = this.galpon.ventas?.filter(v => v.fecha && v.fecha.getTime() === date)
        .reduce((sum, curr) => sum + curr.totalVenta, 0) ?? 0;
      const totalGastos = this.galpon.gastos?.filter(g => g.fecha && g.fecha.getTime() === date)
        .reduce((sum, curr) => sum + curr.total, 0) ?? 0;
      return totalVentas - totalGastos;
    });

    const labels = todasLasFechas.map(ms => new Date(ms).toLocaleDateString('es'));

    const chartData = {
      labels: labels,
      datasets: [{
        label: 'Utilidad',
        data: utilidadData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: '#ffffff',
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            ticks: {
              color: '#ffffff',
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      }
    };

    this.utilidadChart = new Chart(context, config);
  }

  agruparGastosPorConcepto() {
    if (!this.galpon?.gastos) return [];

    return this.galpon.gastos.reduce((acum, gasto: Gastos) => {
      const existente = acum.find(item => item.categoria === gasto.categoria);
      if (existente) {
        existente.total += gasto.total;
      } else {
        acum.push({ ...gasto });
      }
      return acum;
    }, [] as Gastos[]);
  }

  agruparDatos(ventas: Ventas[], intervalo: string): any[] {
    if (intervalo === 'por_cliente') {
      const ventasPorCliente = ventas.reduce((acum: any, venta: Ventas) => {
        const cliente = venta.cliente;
        if (acum[cliente]) {
          acum[cliente].totalVenta += venta.totalVenta;
        } else {
          acum[cliente] = {
            cliente: cliente,
            totalVenta: venta.totalVenta
          };
        }
        return acum;
      }, {});

      return Object.values(ventasPorCliente);
    } else if (intervalo === 'por_tipo') {
      return this.agruparVentasPorTipo(ventas);
    } else {
      switch (intervalo) {
        case 'diario':
          return ventas.reduce(this.agruparPor('fecha'), []);
        case 'semanal':
          return ventas.reduce(this.agruparPor('semana'), []);
        case 'mensual':
          return ventas.reduce(this.agruparPor('mes'), []);
        case 'anual':
          return ventas.reduce(this.agruparPor('año'), []);
        default:
          return [];
      }
    }
  }

  agruparVentasPorTipo(ventas: Ventas[]): any[] {
    const agrupados = ventas.reduce((acum: any, venta: Ventas) => {
      venta.productos.forEach((item: any) => {
        const tipoNormalizado = item.tipo.trim().toLowerCase(); // Normaliza el tipo para evitar duplicados por errores de formato
        if (!acum[tipoNormalizado]) {
          acum[tipoNormalizado] = { tipo: item.tipo, cantidad: 0 };
        }
        const cantidad = Number(item.cantidad);
        if (!isNaN(cantidad)) {
          acum[tipoNormalizado].cantidad += cantidad;
        }
      });
      return acum;
    }, {});
    return Object.values(agrupados);
  }

  agruparPor(key: string) {
    return (acumulador: any[], valorActual: Ventas) => {
      let fecha = new Date(valorActual.fecha ? valorActual.fecha : 0);
      let grupo = this.determinarGrupo(fecha, key);
      let grupoExistente = acumulador.find(g => g.fecha === grupo);
      if (grupoExistente) {
        grupoExistente.totalVenta += valorActual.totalVenta;
      } else {
        acumulador.push({ fecha: grupo, totalVenta: valorActual.totalVenta });
      }
      return acumulador;
    };
  }

  determinarGrupo(fecha: Date, key: string): string {
    switch (key) {
      case 'fecha':
        return fecha.toLocaleDateString('es');
      case 'semana':
        let primerDia = new Date(fecha.setDate(fecha.getDate() - fecha.getDay()));
        let ultimoDia = new Date(primerDia);
        ultimoDia.setDate(primerDia.getDate() + 6);
        return `${primerDia.toLocaleDateString('es')} - ${ultimoDia.toLocaleDateString('es')}`;
      case 'mes':
        return `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
      case 'año':
        return `${fecha.getFullYear()}`;
      default:
        return "No especificado";
    }
  }

  mostrarSeccion(seccion: string) {
    this.mostrarVentas = seccion === 'ventas';
    this.mostrarGastos = seccion === 'gastos';
    this.mostrarGraficas = seccion === 'graficas';
    this.mostrarUtilidades = seccion === 'utilidades';

    if (this.mostrarGraficas) {
      setTimeout(() => {
        this.renderChart();
      }, 100);
    }
  }

  busqueda(event: Event) {
    if (this.mostrarVentas) {
      this.filtrarVentas(event);
    } else if (this.mostrarGastos) {
      this.filtrarGastos(event);
    }
  }

  filtrarVentas(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.ventasFiltradas = this.ventasGalponGrupo.map(grupo =>
      grupo.filter((venta: Ventas) =>
        (venta.id && venta.id.toString().includes(query)) ||
        venta.cliente.toLowerCase().includes(query) ||
        venta.productos.some((detalle: any) => detalle.tipo.toLowerCase().includes(query))
      )
    ).filter(grupo => grupo.length > 0);
    this.currentPageVentas = 0; // Reiniciar la paginación
  }

  filtrarGastos(event: Event) {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.gastosFiltrados = this.gastosGalponGrupo.map(grupo =>
      grupo.filter((gasto: Gastos) =>
        (gasto.id && gasto.id.toString().includes(query)) ||
        gasto.categoria.toLowerCase().includes(query)
      )
    ).filter(grupo => grupo.length > 0);
    this.currentPageGastos = 0; // Reiniciar la paginación
  }

  filterByDateRange() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    if (!this.startDate || !this.endDate) {
      this.ventasFiltradas = [...this.ventasGalponGrupo];
    } else {
      this.ventasFiltradas = this.ventasGalponGrupo.map(grupo =>
        grupo.filter((venta: Ventas) => {
          const ventaFecha = new Date(venta.fecha ? venta.fecha : 0);
          return ventaFecha >= start && ventaFecha <= end;
        })
      ).filter(grupo => grupo.length > 0);
    }

    // Actualizar la gráfica con los nuevos datos filtrados
    this.renderChart();
  }

  filterLast7Days() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.startDate = lastWeek.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.filterByDateRange();
  }

  mostrarInputFecha(event: Event) {
    event.preventDefault();
    this.mostrarInputFechaFlag = true;
  }

  changeFecha: boolean = false;
  alertFechaMessage: boolean = false;

  filtrarPorFecha(fecha: string, isRestart: boolean) {
    if (isRestart) {
      if (this.mostrarVentas) {
        this.ventasFiltradas = this.ventasGalponGrupo.map(grupo =>
          grupo.filter((venta: Ventas) =>
            true
          )
        ).filter(grupo => grupo.length > 0);
        this.currentPageVentas = 0; // Reiniciar la paginación
        return;
      } else if (this.mostrarGastos) {
        this.gastosFiltrados = this.gastosGalponGrupo.map(grupo =>
          grupo.filter((gasto: Gastos) =>
            true
          )
        ).filter(grupo => grupo.length > 0);
        this.currentPageGastos = 0; // Reiniciar la paginación
        return;
      }
    }
    if (fecha == "") {
      this.alertFechaMessage = true;
      return;
    }
    if (this.mostrarVentas) {
      this.fechaVentas(fecha);
    } else if (this.mostrarGastos) {
      this.fechaGastos(fecha);
    }
  }

  fechaVentas(inputFecha: string) {
    let fechaParts = inputFecha.split('-');
    let fechaInput = new Date(Number(fechaParts[0]), Number(fechaParts[1]) - 1, Number(fechaParts[2]));

    this.ventasFiltradas = this.ventasGalponGrupo.map(grupo =>
      grupo.filter((venta: Ventas) =>
        venta.fecha && venta.fecha.setHours(0, 0, 0, 0) === fechaInput.setHours(0, 0, 0, 0)
      )).filter(grupo => grupo.length > 0);
    this.currentPageVentas = 0; // Reiniciar la paginación
  }

  fechaGastos(inputFecha: string) {
    let fechaParts = inputFecha.split('-');
    let fechaInput = new Date(Number(fechaParts[0]), Number(fechaParts[1]) - 1, Number(fechaParts[2]));

    this.gastosFiltrados = this.gastosGalponGrupo.map(grupo =>
      grupo.filter((gasto: Gastos) =>
        gasto.fecha && gasto.fecha.setHours(0, 0, 0, 0) === fechaInput.setHours(0, 0, 0, 0)
      )).filter(grupo => grupo.length > 0);
    this.currentPageGastos = 0; // Reiniciar la paginación
  }

  detallesToString(detalles: { cantidad: number, tipo: string }[]): string {
    return detalles.map(detalle => `${detalle.tipo}:${detalle.cantidad}`).join(',\n');
  }

  ordenarTabla(event: Event) {
    const target = event.target as HTMLSelectElement;
    const valor = target.value;
    let temp = valor.split('-')

    const columna = temp[0];
    const orden = temp[1];
    if (this.mostrarVentas) {
      this.currentPageVentas = 0;
      // Lógica de ordenamiento para la sección de ventas
      if (columna === 'fecha') {
        this.ventasGalpon.sort((a, b) => {
          if (a.fecha && b.fecha) {
            if (orden === 'asc') {
              return a.fecha.getTime() - b.fecha.getTime();
            } else {
              return b.fecha.getTime() - a.fecha.getTime();
            }
          }
          return 0; // Default return value if dates are not defined
        });
      } else if (columna === 'total') {
        this.ventasGalpon.sort((a, b) => {
          if (orden === 'asc') {
            return a.totalVenta - b.totalVenta;
          } else {
            return b.totalVenta - a.totalVenta;
          }
        });
      }
      // Reagrupar los datos en grupos de 5 nuevamente después del ordenamiento
      this.ventasFiltradas = [];
      for (let i = 0; i < this.ventasGalpon.length; i += 5) {
        let grupo = this.ventasGalpon.slice(i, i + 5);
        this.ventasFiltradas.push(grupo);
      }
    } else if (this.mostrarGastos) {
      this.currentPageGastos = 0;
      // Lógica de ordenamiento para la sección de gastos
      if (columna === 'fecha') {
        this.gastosGalpon.sort((a, b) => {
          if (a.fecha && b.fecha) {
            if (orden === 'asc') {
              return a.fecha.getTime() - b.fecha.getTime();
            } else {
              return b.fecha.getTime() - a.fecha.getTime();
            }
          }
          return 0; // Default return value if dates are not defined
        });
      } else if (columna === 'total') {
        this.gastosGalpon.sort((a, b) => {
          if (orden === 'asc') {
            return a.total - b.total;
          } else {
            return b.total - a.total;
          }
        });
      }
      // Reagrupar los datos en grupos de 5 nuevamente después del ordenamiento
      this.gastosFiltrados = [];
      for (let i = 0; i < this.gastosGalpon.length; i += 5) {
        let grupo = this.gastosGalpon.slice(i, i + 5);
        this.gastosFiltrados.push(grupo);
      }
    }
  }
}

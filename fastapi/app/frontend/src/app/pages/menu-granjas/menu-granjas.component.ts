import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GranjaDataService } from 'src/app/services/granja-data.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

import { trigger, transition, style, animate } from '@angular/animations';
import Granja from 'src/app/interfaces/granja.interface';
@Component({
  selector: 'app-menu-granjas',
  templateUrl: './menu-granjas.component.html',
  styleUrls: ['./menu-granjas.component.scss'],
  animations: [
    trigger('fadeInOutFastWidth', [
      transition(':enter', [
        style({ opacity: 0, width: 0 }),
        animate('0.2s linear', style({ opacity: 1, width: '*' })) // '*' indica que se usará la altura actual
      ]),
      transition(':leave', [
        animate('0.2s linear', style({ opacity: 0, width: 0 }))
      ])
    ]),
    trigger('fadeInOutFastHeight', [
      transition(':enter', [
        style({ opacity: 0, height: 0, }),
        animate('0.2s linear', style({ opacity: 1, height: '*' })) // '*' indica que se usará la altura actual
      ]),
      transition(':leave', [
        animate('0.2s linear', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.6s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.6s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MenuGranjasComponent implements OnInit {
  granjas: Granja[] = [];

  path: { name: string, path: string }[] = [
    { name: 'granjas', path: 'menu-granjas' },
  ];

  // diseño
  formGranja: boolean = false; // Formulario para crear una granja
  messageAlertNombre: boolean = false; // Alerta de que ya existe una granja con ese nombre
  messageAlertVacio: boolean = false; // Alerta de que el input esta vacio.
  editMode: boolean = false; // Modo de edición de las granjas

  constructor(
    private router: Router,
    private granjaService: GranjaDataService,
    private authService: UserAuthService
  ) { }

  nameUser: string = ""

  async ngOnInit() {
    await this.authService.verifyUser().then((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/']);
      }
    })
    this.nameUser = this.authService.getUser().name
    this.granjaService.setBasicGranjas();
    this.granjas = this.granjaService.getGranjasUser();
  }

  async option(indexSelection: number) {
    this.granjaService.actualizarGranjaSeleccionada(indexSelection);
    await this.granjaService.setTotalInfoGranja(this.granjas[indexSelection].path);
    this.router.navigate(['/vista-general-granja']);
  }

  async crearGranja(nombre: string) {
    // Validar si ya existe el nombre de la granja
    if (this.granjas.find(granja => granja.name.toLowerCase() === nombre.toLowerCase())) {
      this.messageAlertNombre = true;
      return;
    }

    // Validar si el input esta vacio
    if (nombre === '') {
      this.messageAlertVacio = true;
      return;
    }

    // Crear la granja
    await this.granjaService.crearGranja(nombre).then(() => {
      this.granjas = this.granjaService.getGranjasUser();
      this.formGranja = false;
    }).catch(() => {
      alert('Error al crear la granja');
    });
  }

  async eliminarGranja(index: number) {
    await this.granjaService.eliminarGranja(index).then(() => {
      this.granjas = this.granjaService.getGranjasUser();
      this.editMode = false;
    });
  }

  arrowBack() {
    window.history.back()
  }

  navigateUpload() {
    this.router.navigate(['/upload-data'])
  }
}

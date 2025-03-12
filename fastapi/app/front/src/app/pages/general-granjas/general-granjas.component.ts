import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GalponDataService } from 'src/app/services/galpon-data.service';
import { GranjaDataService } from 'src/app/services/granja-data.service';
import Granja from 'src/app/interfaces/granja.interface';
import { UserAuthService } from 'src/app/services/user-auth.service';

import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-general-granjas',
  templateUrl: './general-granjas.component.html',
  styleUrls: ['./general-granjas.component.scss'],
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
export class GeneralGranjasComponent {
  granja: Granja = { name: '', path: '' };

  nombreSugeridoGalpon: string = ''; // Nombre sugerido para el galpon

  path: { name: string, path: string }[] = [];

  // diseño
  formGranja: boolean = false; // Formulario para crear una granja
  messageAlertNombre: boolean = false; // Alerta de que ya existe una granja con ese nombre
  messageAlertVacio: boolean = false; // Alerta que el input name esta vacio
  editMode: boolean = false; // Modo de edición de las granjas

  chargeIcon: boolean = false;

  constructor(
    private router: Router,
    private authService: UserAuthService,
    private galponService: GalponDataService,
    private granjaService: GranjaDataService
  ) { }

  async ngOnInit() {
    await this.authService.verifyUser().then((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/']);
      }
    })
    const granja = this.granjaService.getGranjaSeleccionada();
    if (granja.galpones) {
      this.granja = granja;
      const ref = this.granja.path.split('/').pop();
      if (ref) {
        this.path = [
          { name: 'granjas', path: 'menu-granjas' },
          { name: ref, path: 'vista-general-granja' },
        ];
      }
    }

  }

  async option(indexSelection: number) {
    this.galponService.setIndexGalpon(indexSelection);
    this.router.navigate(['/menu-seleccion-galpon']);
  }

  arrowBack() {
    window.history.back();
  }

  showForm() {
    if (this.granja.galpones) {
      this.nombreSugeridoGalpon = 'Galpón ' + (this.granja.galpones.length + 1);
    } else {
      this.nombreSugeridoGalpon = 'Galpón 1';
    }
    this.formGranja = true;
  }

  async crearGalpon(name: string) {
    // verificar si ya existe un galpon con ese nombre
    if (this.granja.galpones?.find(galpon => galpon.name.toLowerCase() === name.toLowerCase())) {
      this.messageAlertNombre = true;
      return;
    }

    // Validar si el input esta vacio
    if (name === '') {
      this.messageAlertVacio = true;
      return;
    }

    this.chargeIcon = true;
    await this.granjaService.crearGalpon(name).then(() => {
      this.granja = this.granjaService.getGranjaSeleccionada();
      this.chargeIcon, this.formGranja = false;
    });
  }

  async eliminarGalpon(index: number) {
    this.chargeIcon = true;
    await this.granjaService.eliminarGalpon(index).then(() => {
      this.granja = this.granjaService.getGranjaSeleccionada();
      this.chargeIcon, this.editMode = false;
    });
  }
}

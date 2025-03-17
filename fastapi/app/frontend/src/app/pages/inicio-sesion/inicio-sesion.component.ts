import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/services/user-auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.scss'],
  animations: [
    trigger('fadeInOutFast', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('0.2s linear', style({ opacity: 1, height: '*' })) // '*' indica que se usará la altura actual
      ]),
      transition(':leave', [
        animate('0.2s linear', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('0.6s ease-in', style({ opacity: 1, height: '*' })) // '*' indica que se usará la altura actual
      ]),
      transition(':leave', [
        animate('0.6s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class InicioSesionComponent {

  constructor(
    private userAuthService: UserAuthService,
    private router: Router
  ) { }

  messageError: boolean = false;
  messageErrorForm: boolean = false;
  messageErrorNetwork: boolean = false;

  chargeIcon: boolean = false;

  login(email: string
    , password: string) {
    this.messageError = false;
    this.messageErrorForm = false;
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      this.messageError = true;
      return;
    }

    this.chargeIcon = true;
    this.userAuthService.login(email, password).then((response) => {
      this.chargeIcon = false;
      this.router.navigate(['/menu-granjas']);
    })
  }

}

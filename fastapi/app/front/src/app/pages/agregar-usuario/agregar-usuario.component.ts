import { Component } from '@angular/core';
import { UserAuthService } from 'src/app/services/user-auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { GranjaDataService } from 'src/app/services/granja-data.service';


@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrl: './agregar-usuario.component.scss',
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


export class AgregarUsuarioComponent  {

  granjas: any[] = [];

  constructor( private userAuthService: UserAuthService,
               private router: Router,
               private granjaService: GranjaDataService
  ) { }

  messageError: boolean = false;
  messageErrorForm: boolean = false;

  

register(email: string, password: string, name: string, granjasUser: {path: string }[]) {
  this.messageError = false;
  this.messageErrorForm = false;
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    this.messageError = true;
    return;
  }
  this.userAuthService.register(email, password, name).then(() => {
    this.messageErrorForm = this.userAuthService.isLoggedIn;
  })
}

    

}




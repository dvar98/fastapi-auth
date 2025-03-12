import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GalponDataService } from 'src/app/services/galpon-data.service';
import { GranjaDataService } from 'src/app/services/granja-data.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

@Component({
  selector: 'app-menu-seleccion-galpon',
  templateUrl: './menu-seleccion-galpon.component.html',
  styleUrls: ['./menu-seleccion-galpon.component.scss']
})
export class MenuSeleccionGalponComponent implements OnInit {

  constructor(
    private authService: UserAuthService,
    private router: Router,
    private galponService: GalponDataService,
    private granjaService: GranjaDataService,
  ) { }

  path: { name: string, path: string }[] = [];

  async ngOnInit() {
    await this.authService.verifyUser().then((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/']);
      }
    })

    const refGranja = this.granjaService.getGranjaSeleccionada().path.split('/').pop();
    const refGalpon = this.galponService.getGalpon().ref.split('/').pop();
    if (refGranja && refGalpon) {
      this.path = [
        { name: 'granjas', path: 'menu-granjas' },
        { name: refGranja, path: 'vista-general-granja' },
        { name: refGalpon, path: 'menu-seleccion-galpon' },
      ];
    }
  }

  option(indexSelection: string) {
    this.router.navigate(['/' + indexSelection])
  }

  arrowBack() {
    window.history.back()
  }
}

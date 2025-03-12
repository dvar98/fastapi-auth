import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-link-navegacion',
  templateUrl: './link-navegacion.component.html',
  styleUrl: './link-navegacion.component.scss'
})
export class LinkNavegacionComponent {
  @Input() paths: { name: string, path: string }[] = [];

  constructor(private router: Router) { }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}

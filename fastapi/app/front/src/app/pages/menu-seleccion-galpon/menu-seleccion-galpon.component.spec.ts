import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuSeleccionGalponComponent } from './menu-seleccion-galpon.component';

describe('MenuSeleccionGalponComponent', () => {
  let component: MenuSeleccionGalponComponent;
  let fixture: ComponentFixture<MenuSeleccionGalponComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuSeleccionGalponComponent]
    });
    fixture = TestBed.createComponent(MenuSeleccionGalponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

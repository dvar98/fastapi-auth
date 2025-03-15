import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGranjasComponent } from './menu-granjas.component';

describe('MenuGranjasComponent', () => {
  let component: MenuGranjasComponent;
  let fixture: ComponentFixture<MenuGranjasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuGranjasComponent]
    });
    fixture = TestBed.createComponent(MenuGranjasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

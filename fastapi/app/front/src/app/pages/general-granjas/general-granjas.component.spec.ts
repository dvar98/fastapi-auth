import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralGranjasComponent } from './general-granjas.component';

describe('GeneralGranjasComponent', () => {
  let component: GeneralGranjasComponent;
  let fixture: ComponentFixture<GeneralGranjasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralGranjasComponent]
    });
    fixture = TestBed.createComponent(GeneralGranjasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

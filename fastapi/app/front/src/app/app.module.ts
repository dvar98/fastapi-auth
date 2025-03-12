import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuGranjasComponent } from './pages/menu-granjas/menu-granjas.component';
import { InicioSesionComponent } from './pages/inicio-sesion/inicio-sesion.component';
import { GeneralGranjasComponent } from './pages/general-granjas/general-granjas.component';
import { MenuSeleccionGalponComponent } from './pages/menu-seleccion-galpon/menu-seleccion-galpon.component';
import { VisualizacionDatosComponent } from './pages/visualizacion-datos/visualizacion-datos.component';
import { GastosComponent } from './pages/gastos/gastos.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { UploadDataComponent } from './pages/upload-data/upload-data.component';
import { AgregarUsuarioComponent } from './pages/agregar-usuario/agregar-usuario.component';
import { PopupModalComponent } from './components/popup-modal/popup-modal.component';
import { LinkNavegacionComponent } from './components/link-navegacion/link-navegacion.component';
import { VentasComponent } from './pages/ventas/ventas.component';


registerLocaleData(localeEs, 'es');


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MenuGranjasComponent,
    InicioSesionComponent,
    GeneralGranjasComponent,
    MenuSeleccionGalponComponent,
    VisualizacionDatosComponent,
    VentasComponent,
    GastosComponent,
    UploadDataComponent,
    AgregarUsuarioComponent,
    PopupModalComponent,
    LinkNavegacionComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NgxChartsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

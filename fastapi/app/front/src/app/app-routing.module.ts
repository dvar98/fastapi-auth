import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioSesionComponent } from './pages/inicio-sesion/inicio-sesion.component';
import { MenuGranjasComponent } from './pages/menu-granjas/menu-granjas.component';
import { GeneralGranjasComponent } from './pages/general-granjas/general-granjas.component';
import { MenuSeleccionGalponComponent } from './pages/menu-seleccion-galpon/menu-seleccion-galpon.component';
import { VisualizacionDatosComponent } from './pages/visualizacion-datos/visualizacion-datos.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { GastosComponent } from './pages/gastos/gastos.component';
import { guardsGuard } from './components/header/guards/guards.guard';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { UploadDataComponent } from './pages/upload-data/upload-data.component';
import { AgregarUsuarioComponent } from './pages/agregar-usuario/agregar-usuario.component';



const routes: Routes = [
  {
    path: '',
    component: InicioSesionComponent
  },
  {
    path: 'menu-granjas',
    component: MenuGranjasComponent, canActivate: [guardsGuard]
  },
  {
    path: 'vista-general-granja',
    component: GeneralGranjasComponent
  },
  {
    path: 'menu-seleccion-galpon',
    component: MenuSeleccionGalponComponent
  },
  {
    path: 'visualización-datos',
    component: VisualizacionDatosComponent
  },
  {
    path: 'ventas',
    component: VentasComponent
  },
  {
    path: 'gastos',
    component: GastosComponent
  },
  {
    path: 'inventario',
    component: InventarioComponent
  },
  {
    path: 'upload-data',
    component: UploadDataComponent
  },
  {
  path: 'agregar-usuario',
  component: AgregarUsuarioComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { PublicacionesPageComponent } from './components/publicaciones-page/publicaciones-page';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle';
import { PerfilComponent } from './components/perfil/perfil';
import { CargandoComponent } from './components/cargando/cargando';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { DashboardEstadisticasComponent } from './components/dashboard-estadisticas/dashboard-estadisticas';
import { DashboardUsuariosComponent } from './components/dashboard-usuarios/dashboard-usuarios';

export const routes: Routes = [
  { path: '', component: CargandoComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesPageComponent, canActivate: [authGuard] },
  { path: 'publicacion/:id', component: PublicacionDetalleComponent, canActivate: [authGuard] },
  { path: 'dashboard/usuarios', component: DashboardUsuariosComponent, canActivate: [adminGuard]},
  { path: 'dashboard/estadisticas', component: DashboardEstadisticasComponent, canActivate: [adminGuard] },  
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
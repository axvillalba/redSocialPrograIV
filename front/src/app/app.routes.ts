import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { PublicacionesPageComponent } from './components/publicaciones-page/publicaciones-page';
import { PerfilComponent } from './components/perfil/perfil';
import { CargandoComponent } from './components/cargando/cargando';

export const routes: Routes = [
  { path: '', component: CargandoComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesPageComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: '' }
];
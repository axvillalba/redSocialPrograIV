import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { PublicacionesComponent } from './components/publicaciones/publicaciones';
import { PerfilComponent } from './components/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: 'login' }
];
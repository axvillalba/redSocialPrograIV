import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.obtenerToken()) {
    authService.cerrarSesion();
    router.navigate(['/login']);
    return false;
  }

  if (authService.esAdministrador()) {
    return true;
  }

  // Si está logueado pero es usuario común, lo devuelve al feed
  router.navigate(['/publicaciones']);
  return false;
};
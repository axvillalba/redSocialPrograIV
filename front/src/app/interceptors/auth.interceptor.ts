import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRutaPublicaAuth =
        req.url.includes('/autenticacion/login') ||
        req.url.includes('/autenticacion/registro');

      if (error.status === 401 && !esRutaPublicaAuth) {
        authService.cerrarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
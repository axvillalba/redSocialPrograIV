import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';
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
      if (error.status === 401 && !req.url.includes('/autenticacion/login')) {
        console.error(
          `401 Unauthorized en ${req.method} ${req.url}: el token venció o no es válido. Se cierra la sesión.`,
          error.error
        );
        authService.cerrarSesion();
        router.navigate(['/login']);
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
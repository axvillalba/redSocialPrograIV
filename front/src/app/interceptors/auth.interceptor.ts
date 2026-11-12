import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  let requestClonada = req;

  // Adjuntar Bearer token solo a peticiones hacia nuestra API
  if (token && req.url.startsWith(environment.apiUrl)) {
    requestClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(requestClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.cerrarSesion();
        if (!router.url.includes('/login') && !router.url.includes('/registro')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [],
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss'
})
export class CargandoComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.obtenerToken();

    // 1. Si no hay token guardado, va directo al Login
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Si hay token, se valida contra el backend (POST /autenticacion/autorizar)
    this.authService.autorizar().subscribe({
      next: () => {
        // Token válido: entra a la red social
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token expirado o manipulado: limpia storage y manda al Login
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [CommonModule],
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

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.autorizar().subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  usuario: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  get esAdmin(): boolean {
    return this.authService.esAdministrador() || this.usuario?.perfil === 'administrador';
  }

  cargarUsuario(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      try {
        this.usuario = JSON.parse(usuarioLocal);
      } catch {
        this.usuario = null;
      }
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  obtenerAvatar(): string {
    if (!this.usuario) return this.avatarGenerico();

    const img = this.usuario.imagenPerfilUrl ||
                this.usuario.imagenPerfil ||
                this.usuario.fotoPerfil ||
                this.usuario.avatar ||
                this.usuario.imagenUrl;

    if (!img || typeof img !== 'string') return this.avatarGenerico();
    return img;
  }

  errorImagen(event: any): void {
    event.target.src = this.avatarGenerico();
  }

  private avatarGenerico(): string {
    const nombre = `${this.usuario?.nombre || 'Invocador'}+${this.usuario?.apellido || ''}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=091428&color=c8aa6e&size=64`;
  }
}
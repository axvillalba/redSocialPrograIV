import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  usuario: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      try {
        this.usuario = JSON.parse(usuarioLocal);
      } catch (e) {
        this.usuario = null;
      }
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  obtenerAvatar(): string {
    if (!this.usuario) return this.avatarGenerico();

    // Mapeo exhaustivo para garantizar lectura tras el Login
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
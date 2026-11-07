import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  cargando: boolean = true;
  errorMensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    
    if (!usuarioLocal) {
      this.router.navigate(['/login']);
      return;
    }

    const { id } = JSON.parse(usuarioLocal);

    if (!id) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.obtenerUsuarioPorId(id).subscribe({
      next: (data) => {
        // Log para ver en la consola de F12 la estructura exacta que responde el backend
        console.log('>>> OBJETO USUARIO DEVUELTO POR EL BACKEND:', data);
        
        this.usuario = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('>>> ERROR AL OBTENER EL PERFIL:', err);
        this.errorMensaje = 'No se pudieron cargar los datos del perfil.';
        this.cargando = false;
      }
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  obtenerAvatar(usuario: any): string {
    if (!usuario) return this.obtenerAvatarGenerico();

    // Mapeo de posibles nombres de propiedad según tu Schema de Mongoose
    const img = usuario.imagenPerfil || 
                usuario.imagenPerfilUrl
                usuario.fotoPerfil || 
                usuario.avatar || 
                usuario.imagen || 
                usuario.foto ||
                usuario.imagenUrl;

    if (!img) {
      return this.obtenerAvatarGenerico();
    }

    if (img.startsWith('data:') || img.startsWith('http')) {
      return img;
    }

    return `data:image/jpeg;base64,${img}`;
  }

  errorImagen(event: any): void {
    event.target.src = this.obtenerAvatarGenerico();
  }

  private obtenerAvatarGenerico(): string {
    const nombreCompleto = `${this.usuario?.nombre || 'Invocador'}+${this.usuario?.apellido || ''}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=091428&color=c8aa6e&size=128`;
  }
}
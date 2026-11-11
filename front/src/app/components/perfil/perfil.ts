import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { PublicacionComponent } from '../publicaciones/publicaciones';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, PublicacionComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  ultimasPublicaciones: any[] = [];
  cargando: boolean = true;
  cargandoPublicaciones: boolean = true;
  errorMensaje: string = '';

  editando: boolean = false;
  guardando: boolean = false;
  datosEdicion = {
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    descripcion: '',
    imagenPerfil: ''
  };

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    if (!usuarioLocal) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const parsedUser = JSON.parse(usuarioLocal);
      const id = parsedUser._id || parsedUser.id || (parsedUser.usuario ? parsedUser.usuario._id || parsedUser.usuario.id : null);

      if (!id) {
        this.router.navigate(['/login']);
        return;
      }

      this.cargarPerfil(id);
      this.cargarUltimasPublicaciones(id);
    } catch (e) {
      this.router.navigate(['/login']);
    }
  }

  cargarPerfil(id: string): void {
    this.authService.obtenerUsuarioPorId(id).subscribe({
      next: (data) => {
        this.usuario = data;
        this.cargando = false;
        this.inicializarDatosEdicion();
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
        this.errorMensaje = 'No se pudieron cargar los datos del perfil.';
        this.cargando = false;
      }
    });
  }

  inicializarDatosEdicion(): void {
    if (!this.usuario) return;
    this.datosEdicion = {
      nombre: this.usuario.nombre || '',
      apellido: this.usuario.apellido || '',
      nombreUsuario: this.usuario.nombreUsuario || this.usuario.login || '',
      descripcion: this.usuario.descripcion || '',
      imagenPerfil: this.usuario.imagenPerfil || this.usuario.imagenPerfilUrl || ''
    };
  }

  activarEdicion(): void {
    this.inicializarDatosEdicion();
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.editando = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar imagen a 200x200 para avatar liviano (~30KB)
          const canvas = document.createElement('canvas');
          const TAMANO_AVATAR = 200;
          canvas.width = TAMANO_AVATAR;
          canvas.height = TAMANO_AVATAR;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, TAMANO_AVATAR, TAMANO_AVATAR);
            const base64Comprimido = canvas.toDataURL('image/jpeg', 0.7);
            this.datosEdicion.imagenPerfil = base64Comprimido;
            if (this.usuario) {
              this.usuario.imagenPerfil = base64Comprimido;
            }
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
    const id = this.usuario?._id || this.usuario?.id;
    if (!id) return;

    this.guardando = true;
    this.authService.actualizarUsuario(id, this.datosEdicion).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        this.editando = false;
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al guardar datos:', err);
        alert('Ocurrió un error al intentar actualizar los datos.');
        this.guardando = false;
      }
    });
  }

  cargarUltimasPublicaciones(usuarioId: string): void {
    if (!usuarioId) return;

    this.cargandoPublicaciones = true;
    this.publicacionesService.obtenerPublicaciones({
      usuarioId: usuarioId,
      limit: 3,
      orden: 'fecha'
    }).subscribe({
      next: (posts) => {
        this.ultimasPublicaciones = posts;
        this.cargandoPublicaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar publicaciones del perfil:', err);
        this.cargandoPublicaciones = false;
      }
    });
  }

  handleLikeToggle(pub: any): void {
    const usuarioId = this.usuario?._id || this.usuario?.id;
    if (!usuarioId) return;

    const yaDioLike = pub.meGusta?.some((id: any) => {
      const idStr = typeof id === 'string' ? id : (id._id || id.id || id.toString());
      return idStr === usuarioId;
    });

    const accion = yaDioLike
      ? this.publicacionesService.quitarMeGusta(pub._id, usuarioId)
      : this.publicacionesService.darMeGusta(pub._id, usuarioId);

    accion.subscribe({
      next: () => this.cargarUltimasPublicaciones(usuarioId),
      error: (err) => console.error('Error al alternar Me Gusta:', err)
    });
  }

  handleEliminar(publicacionId: string): void {
    const usuarioId = this.usuario?._id || this.usuario?.id;
    if (!usuarioId) return;

    this.publicacionesService.eliminarPublicacion(publicacionId, usuarioId).subscribe({
      next: () => this.cargarUltimasPublicaciones(usuarioId),
      error: (err) => console.error('Error al eliminar publicación:', err)
    });
  }

  obtenerAvatar(usuario: any): string {
    if (!usuario) return this.obtenerAvatarGenerico();

    const img = usuario.imagenPerfil || 
                usuario.imagenPerfilUrl ||
                usuario.fotoPerfil || 
                usuario.avatar || 
                usuario.imagen || 
                usuario.foto ||
                usuario.imagenUrl;

    if (!img) return this.obtenerAvatarGenerico();
    if (img.startsWith('data:') || img.startsWith('http')) return img;
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
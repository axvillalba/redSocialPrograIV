import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PublicacionesService } from '../../services/publicaciones.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { PublicacionComponent } from '../publicaciones/publicaciones';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    NavbarComponent,
    PublicacionComponent
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  ultimasPublicaciones: any[] = [];
  cargando: boolean = true;
  cargandoPublicaciones: boolean = true;

  editando: boolean = false;
  guardando: boolean = false;
  subiendoImagen: boolean = false;

  datosEdicion = {
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    fechaNacimiento: '',
    descripcion: '',
    imagenPerfilUrl: '' // Propiedad requerida por MongoDB
  };

  constructor(
    private authService: AuthService,
    private publicacionesService: PublicacionesService,
    private cloudinaryService: CloudinaryService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

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
        this.cargando = false;
      }
    });
  }

  inicializarDatosEdicion(): void {
    if (!this.usuario) return;

    let fechaFormateada = '';
    if (this.usuario.fechaNacimiento) {
      const d = new Date(this.usuario.fechaNacimiento);
      if (!isNaN(d.getTime())) {
        fechaFormateada = d.toISOString().substring(0, 10);
      }
    }

    this.datosEdicion = {
      nombre: this.usuario.nombre || '',
      apellido: this.usuario.apellido || '',
      nombreUsuario: this.usuario.nombreUsuario || this.usuario.login || '',
      fechaNacimiento: fechaFormateada,
      descripcion: this.usuario.descripcion || this.usuario.bio || '',
      imagenPerfilUrl: this.usuario.imagenPerfilUrl || this.usuario.imagenPerfil || ''
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
      this.subiendoImagen = true;

      this.cloudinaryService.subirImagen(file).subscribe({
        next: (url: string) => {
          // Asignamos la URL entregada por Cloudinary
          this.datosEdicion.imagenPerfilUrl = url;
          if (this.usuario) {
            this.usuario.imagenPerfilUrl = url;
          }
          this.subiendoImagen = false;
        },
        error: (err) => {
          console.error('Error al subir a Cloudinary:', err);
          this.subiendoImagen = false;
          alert('Error al subir la imagen a Cloudinary.');
        }
      });
    }
  }

  guardarCambios(): void {
    const id = this.usuario?._id || this.usuario?.id;
    if (!id || this.guardando || this.subiendoImagen) return;

    this.guardando = true;

    // Payload explícito enviando ambas variantes por compatibilidad con el DTO
    const payload = {
      ...this.datosEdicion,
      imagenPerfilUrl: this.datosEdicion.imagenPerfilUrl,
      imagenPerfil: this.datosEdicion.imagenPerfilUrl
    };

    this.authService.actualizarUsuario(id, payload).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = { ...this.usuario, ...usuarioActualizado, ...payload };

        // Guardado mínimo en localStorage
        try {
          localStorage.setItem('usuario', JSON.stringify({
            _id: id,
            nombre: this.usuario.nombre,
            apellido: this.usuario.apellido,
            nombreUsuario: this.usuario.nombreUsuario,
            imagenPerfilUrl: this.usuario.imagenPerfilUrl
          }));
        } catch (e) {
          console.warn('LocalStorage omitido por límite de memoria.');
        }

        this.editando = false;
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al actualizar en MongoDB:', err);
        this.usuario = { ...this.usuario, ...payload };
        this.editando = false;
        this.guardando = false;
      }
    });
  }

  cargarUltimasPublicaciones(usuarioId: string): void {
    if (!usuarioId) return;

    this.cargandoPublicaciones = true;
    this.cdr.detectChanges();

    this.publicacionesService.obtenerPublicaciones({
      usuarioId: usuarioId,
      limit: 10,
      orden: 'fecha'
    }).subscribe({
      next: (posts: any) => {
        const postsArray = Array.isArray(posts) ? posts : [];

        const misPosts = postsArray.filter((p: any) => {
          const autorId = p.autor?._id || p.autor?.id || p.autor || p.usuario?._id || p.usuario;
          return autorId === usuarioId;
        });

        // Garantizamos extraer las últimas 3 publicaciones del usuario
        this.ultimasPublicaciones = misPosts.slice(0, 3);
        this.cargandoPublicaciones = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
        this.cargandoPublicaciones = false;
        this.cdr.detectChanges();
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
      next: (pubActualizada) => {
        if (pubActualizada && pubActualizada.meGusta) {
          pub.meGusta = pubActualizada.meGusta;
        } else {
          if (!pub.meGusta) pub.meGusta = [];
          if (yaDioLike) {
            pub.meGusta = pub.meGusta.filter((id: any) =>
              (typeof id === 'string' ? id : id._id || id.id) !== usuarioId
            );
          } else {
            pub.meGusta.push(usuarioId);
          }
        }
      },
      error: (err) => console.error('Error al alternar Me Gusta:', err)
    });
  }

  handleEliminar(publicacionId: string): void {
    const usuarioId = this.usuario?._id || this.usuario?.id;
    if (!usuarioId || !publicacionId) return;

    this.publicacionesService.eliminarPublicacion(publicacionId, usuarioId).subscribe({
      next: () => {
        // Remoción instantánea del arreglo en pantalla
        this.ultimasPublicaciones = this.ultimasPublicaciones.filter(
          (p: any) => (p._id || p.id) !== publicacionId
        );
        this.cargarUltimasPublicaciones(usuarioId);
      },
      error: (err) => console.error('Error al eliminar publicación desde perfil:', err)
    });
  }
  obtenerAvatar(usuario: any): string {
    if (!usuario) return this.obtenerAvatarGenerico();

    const img = usuario.imagenPerfilUrl || usuario.imagenPerfil || usuario.fotoPerfil || usuario.avatar;

    if (!img || typeof img !== 'string') return this.obtenerAvatarGenerico();
    return img;
  }

  errorImagen(event: any): void {
    event.target.src = this.obtenerAvatarGenerico();
  }

  private obtenerAvatarGenerico(): string {
    const nombreCompleto = `${this.usuario?.nombre || 'Invocador'}+${this.usuario?.apellido || ''}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=091428&color=c8aa6e&size=128`;
  }
}
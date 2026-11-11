import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { PublicacionComponent } from '../publicaciones/publicaciones';
import { ModalComponent } from '../modal/modal';
import { PublicacionesService } from '../../services/publicaciones.service';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-publicaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, PublicacionComponent, ModalComponent],
  templateUrl: './publicaciones-page.html',
  styleUrls: ['./publicaciones-page.scss'],
})
export class PublicacionesPageComponent implements OnInit {
  publicaciones: any[] = [];
  ordenSeleccionado: 'fecha' | 'meGusta' = 'fecha';
  limit: number = 5;
  offset: number = 0;
  paginaActual: number = 1;
  usuarioActualId: string = '';

  // Estados de carga e interacción
  cargandoFeed: boolean = false;
  creandoPost: boolean = false;
  subiendoImagen: boolean = false;
  idsProcesandoLike: Set<string> = new Set<string>();

  // Configuración de Modal
  modalState = {
    mostrar: false,
    titulo: 'ATENCIÓN',
    mensaje: '',
    tipo: 'alerta' as 'alerta' | 'confirmacion'
  };

  nuevoPost = {
    titulo: '',
    descripcion: '',
    imagenUrl: '',
  };

  constructor(
    private publicacionesService: PublicacionesService,
    private cloudinaryService: CloudinaryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    if (!usuarioLocal) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const parsed = JSON.parse(usuarioLocal);
      this.usuarioActualId = parsed._id || parsed.id || '';
    } catch (e) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPublicaciones();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.subiendoImagen = true;

      this.cloudinaryService.subirImagen(file).subscribe({
        next: (url) => {
          this.nuevoPost.imagenUrl = url;
          this.subiendoImagen = false;
        },
        error: (err) => {
          console.error('Error al subir a Cloudinary:', err);
          this.subiendoImagen = false;
          this.mostrarAlerta('Ocurrió un error al subir la imagen. Verificá tu preset de Cloudinary.', 'ERROR');
        }
      });
    }
  }

  quitarImagen(): void {
    this.nuevoPost.imagenUrl = '';
  }

  mostrarAlerta(mensaje: string, titulo: string = 'ATENCIÓN'): void {
    this.modalState = {
      mostrar: true,
      titulo,
      mensaje,
      tipo: 'alerta'
    };
  }

  cerrarModal(): void {
    this.modalState.mostrar = false;
  }

  crearPublicacion(): void {
    if (!this.nuevoPost.titulo.trim() || !this.nuevoPost.descripcion.trim()) {
      this.mostrarAlerta('Por favor, ingresá un título y un mensaje antes de publicar.');
      return;
    }

    if (this.creandoPost || this.subiendoImagen) return;

    this.creandoPost = true;

    const payload = {
      titulo: this.nuevoPost.titulo,
      mensaje: this.nuevoPost.descripcion,
      imagenUrl: this.nuevoPost.imagenUrl,
      autor: this.usuarioActualId
    };

    this.publicacionesService.crearPublicacion(payload).subscribe({
      next: () => {
        this.nuevoPost = { titulo: '', descripcion: '', imagenUrl: '' };
        this.creandoPost = false;
        this.cargarPublicaciones();
      },
      error: (err) => {
        this.creandoPost = false;
        this.mostrarAlerta(err.error?.message || 'Error al crear la publicación.', 'ERROR');
      },
    });
  }

  cargarPublicaciones(): void {
    this.cargandoFeed = true;
    this.publicacionesService
      .obtenerPublicaciones({
        orden: this.ordenSeleccionado,
        limit: this.limit,
        offset: this.offset,
      })
      .subscribe({
        next: (data) => {
          this.publicaciones = data;
          this.cargandoFeed = false;
        },
        error: (err) => {
          console.error('Error al obtener publicaciones:', err);
          this.cargandoFeed = false;
        },
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'meGusta'): void {
    if (this.ordenSeleccionado === nuevoOrden || this.cargandoFeed) return;
    this.ordenSeleccionado = nuevoOrden;
    this.offset = 0;
    this.paginaActual = 1;
    this.cargarPublicaciones();
  }

  paginaSiguiente(): void {
    if (this.cargandoFeed) return;
    this.offset += this.limit;
    this.paginaActual++;
    this.cargarPublicaciones();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior(): void {
    if (this.offset < this.limit || this.cargandoFeed) return;
    this.offset -= this.limit;
    this.paginaActual--;
    this.cargarPublicaciones();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleLikeToggle(pub: any): void {
    if (!this.usuarioActualId || this.idsProcesandoLike.has(pub._id)) return;

    this.idsProcesandoLike.add(pub._id);

    const yaDioLike = pub.meGusta?.some((id: any) => 
      (typeof id === 'string' ? id : id._id || id.id) === this.usuarioActualId
    );

    const accion = yaDioLike
      ? this.publicacionesService.quitarMeGusta(pub._id, this.usuarioActualId)
      : this.publicacionesService.darMeGusta(pub._id, this.usuarioActualId);

    accion.subscribe({
      next: (pubActualizada) => {
        this.idsProcesandoLike.delete(pub._id);

        // Actualización en caliente sin recargar toda la lista ni hacer scroll
        if (pubActualizada && pubActualizada.meGusta) {
          pub.meGusta = pubActualizada.meGusta;
        } else {
          if (!pub.meGusta) pub.meGusta = [];
          if (yaDioLike) {
            pub.meGusta = pub.meGusta.filter((id: any) => 
              (typeof id === 'string' ? id : id._id || id.id) !== this.usuarioActualId
            );
          } else {
            pub.meGusta.push(this.usuarioActualId);
          }
        }
      },
      error: (err) => {
        this.idsProcesandoLike.delete(pub._id);
        console.error('Error al procesar Me Gusta:', err);
      },
    });
  }

handleEliminar(publicacionId: string): void {
  if (!this.usuarioActualId || !publicacionId) return;

  this.publicacionesService.eliminarPublicacion(publicacionId, this.usuarioActualId).subscribe({
    next: () => {
      // Remoción instantánea del feed principal
      this.publicaciones = this.publicaciones.filter(
        (p: any) => (p._id || p.id) !== publicacionId
      );
      this.cargarPublicaciones();
    },
    error: (err) => console.error('Error al eliminar publicación desde el feed:', err)
  });
}
}
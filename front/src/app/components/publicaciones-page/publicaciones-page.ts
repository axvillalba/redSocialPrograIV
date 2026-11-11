import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { PublicacionComponent } from '../publicaciones/publicaciones';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, PublicacionComponent],
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

  nuevoPost = {
    titulo: '',
    descripcion: '',
    imagenUrl: '',
  };

  constructor(
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
      const parsed = JSON.parse(usuarioLocal);
      this.usuarioActualId = parsed._id || parsed.id || '';
    } catch (e) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPublicaciones();
  }

  crearPublicacion(): void {
    if (!this.nuevoPost.titulo.trim() || !this.nuevoPost.descripcion.trim()) {
      alert('Por favor, ingresá un título y un mensaje.');
      return;
    }

    // Se mapea 'descripcion' a 'mensaje' y 'usuarioActualId' a 'autor'
    const payload = {
      titulo: this.nuevoPost.titulo,
      mensaje: this.nuevoPost.descripcion,
      imagenUrl: this.nuevoPost.imagenUrl,
      autor: this.usuarioActualId
    };

    this.publicacionesService.crearPublicacion(payload).subscribe({
      next: () => {
        this.nuevoPost = { titulo: '', descripcion: '', imagenUrl: '' };
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al crear publicación:', err);
        alert(err.error?.message || 'Error al crear la publicación.');
      },
    });
  }

  cargarPublicaciones(): void {
    this.publicacionesService
      .obtenerPublicaciones({
        orden: this.ordenSeleccionado,
        limit: this.limit,
        offset: this.offset,
      })
      .subscribe({
        next: (data) => {
          this.publicaciones = data;
        },
        error: (err) => console.error('Error al obtener publicaciones:', err),
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'meGusta'): void {
    if (this.ordenSeleccionado === nuevoOrden) return;
    this.ordenSeleccionado = nuevoOrden;
    this.offset = 0;
    this.paginaActual = 1;
    this.cargarPublicaciones();
  }

  paginaSiguiente(): void {
    this.offset += this.limit;
    this.paginaActual++;
    this.cargarPublicaciones();
  }

  paginaAnterior(): void {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      this.paginaActual--;
      this.cargarPublicaciones();
    }
  }

  handleLikeToggle(pub: any): void {
    if (!this.usuarioActualId) return;

    const yaDioLike = pub.meGusta?.some((id: any) => 
      (typeof id === 'string' ? id : id._id || id.id) === this.usuarioActualId
    );

    const accion = yaDioLike
      ? this.publicacionesService.quitarMeGusta(pub._id, this.usuarioActualId)
      : this.publicacionesService.darMeGusta(pub._id, this.usuarioActualId);

    accion.subscribe({
      next: () => this.cargarPublicaciones(),
      error: (err) => console.error('Error al procesar Me Gusta:', err),
    });
  }

  handleEliminar(publicacionId: string): void {
    if (!this.usuarioActualId) return;

    this.publicacionesService
      .eliminarPublicacion(publicacionId, this.usuarioActualId)
      .subscribe({
        next: () => this.cargarPublicaciones(),
        error: (err) => console.error('Error al eliminar publicación:', err),
      });
  }
}
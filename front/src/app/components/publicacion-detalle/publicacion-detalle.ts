import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones.service';
import { AuthService } from '../../services/auth';
import { NavbarComponent } from '../navbar/navbar';
import { TiempoHacePipe } from '../../pipes/tiempo-hace.pipe';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, TiempoHacePipe],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.scss'
})
export class PublicacionDetalleComponent implements OnInit {
  publicacionId: string = '';
  publicacion: any = null;
  usuarioActual: any = null;

  cargandoPublicacion: boolean = true;
  procesandoLike: boolean = false;

  // Estado de comentarios y paginación
  comentarios: any[] = [];
  totalComentarios: number = 0;
  hayMasComentarios: boolean = false;
  cargandoComentarios: boolean = false;
  cargandoMas: boolean = false;
  readonly LIMIT_COMENTARIOS = 5;
  offsetComentarios: number = 0;

  // Nuevo comentario
  nuevoComentario: string = '';
  enviandoComentario: boolean = false;

  // Edición inline de comentario
  comentarioEditandoId: string | null = null;
  mensajeEditado: string = '';
  guardandoEdicion: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacionesService: PublicacionesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.publicacionId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.publicacionId) {
      this.router.navigate(['/publicaciones']);
      return;
    }

    this.cargarDetallePublicacion();
    this.cargarComentarios(true);
  }

  get autorPublicacion(): any {
    return this.publicacion?.autor || this.publicacion?.usuario || {};
  }

  get dioMeGusta(): boolean {
    const idUser = this.usuarioActual?._id || this.usuarioActual?.id;
    if (!idUser || !this.publicacion?.meGusta) return false;
    return this.publicacion.meGusta.some(
      (like: any) => (like?._id || like) === idUser
    );
  }

  cargarDetallePublicacion(): void {
    this.cargandoPublicacion = true;
    this.cdr.detectChanges();

    this.publicacionesService.obtenerPublicacionPorId(this.publicacionId).subscribe({
      next: (res: any) => {
        this.publicacion = res;
        this.cargandoPublicacion = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la publicación:', err);
        this.cargandoPublicacion = false;
        this.cdr.detectChanges();
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  cargarComentarios(reiniciar: boolean = false): void {
    if (reiniciar) {
      this.offsetComentarios = 0;
      this.cargandoComentarios = true;
    } else {
      this.cargandoMas = true;
    }
    this.cdr.detectChanges();

    this.publicacionesService
      .obtenerComentarios(this.publicacionId, this.LIMIT_COMENTARIOS, this.offsetComentarios)
      .subscribe({
        next: (res: any) => {
          const nuevos = res.comentarios || [];
          // Si es primera carga reemplaza; si es "Cargar más" acumula debajo sin perder los anteriores
          this.comentarios = reiniciar ? nuevos : [...this.comentarios, ...nuevos];
          this.totalComentarios = res.total ?? this.comentarios.length;
          this.hayMasComentarios = !!res.hayMas;
          this.offsetComentarios += nuevos.length;

          this.cargandoComentarios = false;
          this.cargandoMas = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar comentarios:', err);
          this.cargandoComentarios = false;
          this.cargandoMas = false;
          this.cdr.detectChanges();
        }
      });
  }

  enviarComentario(): void {
    const texto = this.nuevoComentario.trim();
    const usuarioId = this.usuarioActual?._id || this.usuarioActual?.id;

    if (!texto || !usuarioId || this.enviandoComentario) return;

    this.enviandoComentario = true;
    this.cdr.detectChanges();

    this.publicacionesService.agregarComentario(this.publicacionId, usuarioId, texto).subscribe({
      next: (comentarioCreado: any) => {
        
        this.comentarios = [comentarioCreado, ...this.comentarios];
        this.totalComentarios++;
        this.offsetComentarios++;
        this.nuevoComentario = '';
        this.enviandoComentario = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al comentar:', err);
        this.enviandoComentario = false;
        this.cdr.detectChanges();
      }
    });
  }

  esAutorComentario(comentario: any): boolean {
    const idUser = this.usuarioActual?._id || this.usuarioActual?.id;
    const idAutorComentario = comentario?.usuario?._id || comentario?.usuario;
    return !!idUser && idUser === idAutorComentario;
  }

  iniciarEdicion(comentario: any): void {
    this.comentarioEditandoId = comentario._id;
    this.mensajeEditado = comentario.mensaje;
    this.cdr.detectChanges();
  }

  cancelarEdicion(): void {
    this.comentarioEditandoId = null;
    this.mensajeEditado = '';
    this.cdr.detectChanges();
  }

  guardarEdicion(comentario: any): void {
    const texto = this.mensajeEditado.trim();
    const usuarioId = this.usuarioActual?._id || this.usuarioActual?.id;

    if (!texto || !usuarioId || this.guardandoEdicion) return;

    this.guardandoEdicion = true;
    this.cdr.detectChanges();

    this.publicacionesService
      .editarComentario(this.publicacionId, comentario._id, usuarioId, texto)
      .subscribe({
        next: (actualizado: any) => {
          const idx = this.comentarios.findIndex((c) => c._id === comentario._id);
          if (idx !== -1) {
            this.comentarios[idx] = {
              ...this.comentarios[idx],
              mensaje: actualizado.mensaje,
              modificado: true
            };
          }
          this.comentarioEditandoId = null;
          this.mensajeEditado = '';
          this.guardandoEdicion = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al editar comentario:', err);
          this.guardandoEdicion = false;
          this.cdr.detectChanges();
        }
      });
  }

  toggleLike(): void {
    const usuarioId = this.usuarioActual?._id || this.usuarioActual?.id;
    if (!usuarioId || this.procesandoLike || !this.publicacion) return;

    this.procesandoLike = true;
    this.cdr.detectChanges();

    const peticion$ = this.dioMeGusta
      ? this.publicacionesService.quitarMeGusta(this.publicacionId, usuarioId)
      : this.publicacionesService.darMeGusta(this.publicacionId, usuarioId);

    peticion$.subscribe({
      next: (res: any) => {
        if (res?.meGusta) {
          this.publicacion.meGusta = res.meGusta;
        } else if (this.dioMeGusta) {
          this.publicacion.meGusta = this.publicacion.meGusta.filter(
            (id: any) => (id?._id || id) !== usuarioId
          );
        } else {
          this.publicacion.meGusta = [...(this.publicacion.meGusta || []), usuarioId];
        }
        this.procesandoLike = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar Me Gusta:', err);
        this.procesandoLike = false;
        this.cdr.detectChanges();
      }
    });
  }
}
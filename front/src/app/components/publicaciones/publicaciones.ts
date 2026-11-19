import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../modal/modal';
import { TiempoHacePipe } from '../../pipes/tiempo-hace.pipe';
import { TruncarTextoPipe } from '../../pipes/truncar-texto.pipe';
import { AuthService } from '../../services/auth';
import { AvatarFallbackDirective } from '../../directives/avatar-fallback.directive';
import { HextechGlowDirective } from '../../directives/hextech-glow.directive';
import { RangoInvocadorPipe } from '../../pipes/rango-maestria.pipe';
import { SonidoService } from '../../services/sonido.service';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, RangoInvocadorPipe, ModalComponent, AvatarFallbackDirective, HextechGlowDirective, TiempoHacePipe, TruncarTextoPipe, RouterLink],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.scss'],
})
export class PublicacionComponent {
  @Input() publicacion!: any;
  @Input() usuarioActualId!: string;
  @Input() procesandoLike: boolean = false;
  @Input() cantidadPostsAutor?: number;

  @Output() meGustaToggled = new EventEmitter<void>();
  @Output() eliminarSolicitado = new EventEmitter<string>();
//@Output () sonidoService = new EventEmitter<void>();
  mostrarModalEliminar: boolean = false;

  constructor(private authService: AuthService,private sonidoService: SonidoService) { }

  get usuarioYaDioLike(): boolean {
    if (!this.publicacion?.meGusta || !this.usuarioActualId) return false;
    return this.publicacion.meGusta.some((id: any) => {
      const idStr = typeof id === 'string' ? id : (id._id || id.id || id.toString());
      return idStr === this.usuarioActualId;
    });
  }
  get totalPostsDelAutor(): number {
    return this.cantidadPostsAutor
      ?? this.publicacion?.autor?.cantidadPublicaciones
      ?? this.publicacion?.cantidadPublicacionesAutor
      ?? 0;
  }

  get puedeEliminar(): boolean {
    if (!this.publicacion) return false;
    if (this.authService.esAdministrador()) return true;
    if (!this.usuarioActualId) return false;

    const creador = this.publicacion.autor || this.publicacion.usuario;
    if (!creador) return false;
    const autorId = typeof creador === 'string' ? creador : (creador._id || creador.id || creador.toString());
    return autorId === this.usuarioActualId;
  }

  // Se mantiene este alias para que funcione tanto con *ngIf="esMiPublicacion" como con *ngIf="puedeEliminar"
  get esMiPublicacion(): boolean {
    return this.puedeEliminar;
  }

  toggleLike(): void {
    if (this.procesandoLike) return;
    this.sonidoService.reproducirClicHextech();
    this.meGustaToggled.emit();
  }

  solicitarEliminar(): void {
    this.mostrarModalEliminar = true;
  }


  confirmarEliminacion(): void {
    this.mostrarModalEliminar = false;
    const pubId = this.publicacion?._id || this.publicacion?.id;
    if (pubId) {
      this.eliminarSolicitado.emit(pubId);
    }
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
  }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal';
import { TiempoHacePipe } from '../../pipes/tiempo-hace.pipe';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule, ModalComponent, TiempoHacePipe],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.scss'],
})
export class PublicacionComponent {
  @Input() publicacion!: any;
  @Input() usuarioActualId!: string;
  @Input() procesandoLike: boolean = false;

  @Output() meGustaToggled = new EventEmitter<void>();
  @Output() eliminarSolicitado = new EventEmitter<string>();

  mostrarModalEliminar: boolean = false;

  get usuarioYaDioLike(): boolean {
    if (!this.publicacion?.meGusta || !this.usuarioActualId) return false;
    return this.publicacion.meGusta.some((id: any) => {
      const idStr = typeof id === 'string' ? id : (id._id || id.id || id.toString());
      return idStr === this.usuarioActualId;
    });
  }

  get esMiPublicacion(): boolean {
    if (!this.publicacion || !this.usuarioActualId) return false;
    const creador = this.publicacion.autor || this.publicacion.usuario;
    if (!creador) return false;
    const autorId = typeof creador === 'string' ? creador : (creador._id || creador.id || creador.toString());
    return autorId === this.usuarioActualId;
  }

  toggleLike(): void {
    if (this.procesandoLike) return;
    this.meGustaToggled.emit();
  }

  solicitarEliminar(): void {
    this.mostrarModalEliminar = true;
  }

  confirmarEliminacion(): void {
    this.mostrarModalEliminar = false;
    // Resolución defensiva de _id / id
    const pubId = this.publicacion?._id || this.publicacion?.id;
    if (pubId) {
      this.eliminarSolicitado.emit(pubId);
    }
  }

  cancelarEliminacion(): void {
    this.mostrarModalEliminar = false;
  }
}
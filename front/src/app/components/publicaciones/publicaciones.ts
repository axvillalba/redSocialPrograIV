import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.scss'],
})
export class PublicacionComponent {
  @Input() publicacion!: any;
  @Input() usuarioActualId!: string;

  @Output() meGustaToggled = new EventEmitter<void>();
  @Output() eliminarSolicitado = new EventEmitter<string>();

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
    this.meGustaToggled.emit();
  }

  eliminar(): void {
    if (confirm('¿Deseas eliminar esta publicación de la Grieta?')) {
      this.eliminarSolicitado.emit(this.publicacion._id);
    }
  }
}
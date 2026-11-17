import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent {
  @Input() mostrar: boolean = false;
  @Input() titulo: string = 'ATENCIÓN';
  @Input() mensaje: string = '';
  @Input() tipo: 'alerta' | 'confirmacion' = 'alerta';
  @Input() textoConfirmar: string = 'ACEPTAR';
  @Input() textoCancelar: string = 'CANCELAR';
  @Input() segundosRestantes: number | null = null;
  @Input() segundosTotales = 30;

  @Output() alConfirmar = new EventEmitter<void>();
  @Output() alCancelar = new EventEmitter<void>();

  confirmar(): void {
    this.alConfirmar.emit();
  }

  cancelar(): void {
    this.alCancelar.emit();
  }
  
  get porcentajeTiempo(): number {
    if (this.segundosRestantes === null || this.segundosTotales <= 0) return 0;
    return Math.max(0, Math.min(100, (this.segundosRestantes / this.segundosTotales) * 100));
  }
}
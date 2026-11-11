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

  @Output() alConfirmar = new EventEmitter<void>();
  @Output() alCancelar = new EventEmitter<void>();

  confirmar(): void {
    this.alConfirmar.emit();
  }

  cancelar(): void {
    this.alCancelar.emit();
  }
}
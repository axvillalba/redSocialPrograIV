import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; text-align: center;">
      <h2 class="lol-title">Muro de la Grieta</h2>
      <p style="color: var(--text-secondary);">Listado de publicaciones en desarrollo...</p>
    </div>
  `
})
export class PublicacionesComponent {}
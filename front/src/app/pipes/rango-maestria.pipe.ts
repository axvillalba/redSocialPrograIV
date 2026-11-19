import { Pipe, PipeTransform } from '@angular/core';

export interface InfoRango {
  nombre: string;
  clase: string;
  icono: string;
}

@Pipe({
  name: 'rangoInvocador',
  standalone: true
})
export class RangoInvocadorPipe implements PipeTransform {
  transform(cantidadPublicaciones: number = 0): InfoRango {
    if (cantidadPublicaciones >= 15) {
      return { nombre: 'Retador', clase: 'rango-retador', icono: '👑' };
    }
    if (cantidadPublicaciones >= 8) {
      return { nombre: 'Diamante', clase: 'rango-diamante', icono: '💎' };
    }
    if (cantidadPublicaciones >= 3) {
      return { nombre: 'Oro Hextech', clase: 'rango-oro', icono: '⚜️' };
    }
    return { nombre: 'Hierro', clase: 'rango-hierro', icono: '🛡️' };
  }
}
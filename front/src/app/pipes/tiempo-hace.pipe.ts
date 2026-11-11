import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoHace',
  standalone: true,
})
export class TiempoHacePipe implements PipeTransform {
  transform(value: string | Date | number): string {
    if (!value) return '';

    const fechaInput = new Date(value);
    const ahora = new Date();
    const segundos = Math.floor((ahora.getTime() - fechaInput.getTime()) / 1000);

    if (isNaN(segundos) || segundos < 30) return 'Hace un momento';

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) {
      return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
    }

    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
    }

    const dias = Math.floor(horas / 24);
    if (dias < 30) {
      return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
    }

    const meses = Math.floor(dias / 30);
    if (meses < 12) {
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    }

    const anios = Math.floor(meses / 12);
    return anios === 1 ? 'Hace 1 año' : `Hace ${anios} años`;
  }
}
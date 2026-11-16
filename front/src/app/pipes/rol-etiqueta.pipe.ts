import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rolEtiqueta',
  standalone: true,
})
export class RolEtiquetaPipe implements PipeTransform {
  transform(perfil: string | null | undefined, conIcono: boolean = true): string {
    const rolNormalizado = (perfil || 'usuario').toLowerCase().trim();

    if (rolNormalizado === 'administrador' || rolNormalizado === 'admin') {
      return conIcono ? '🛡️ Administrador' : 'Administrador';
    }

    return conIcono ? '⚔️ Invocador' : 'Invocador';
  }
}
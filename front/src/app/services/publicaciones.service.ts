import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private readonly baseUrl = 'https://red-social-progra-iv.vercel.app'; // O tu URL de backend
  //private readonly baseUrl = 'http://localhost:3000';  //A modo de prueba
  constructor(private readonly http: HttpClient) {}

  // Aceptar 'any' para evitar incompatibilidad de tipos al enviar payload
  crearPublicacion(publicacion: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/publicaciones`, publicacion);
  }

obtenerPublicaciones(params: {
  orden?: string;
  limit?: number;
  offset?: number;
  usuarioId?: string;
  autor?: string;
}): Observable<any[]> {
  let httpParams = new HttpParams();

  if (params.orden) httpParams = httpParams.set('orden', params.orden);
  if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
  if (params.offset !== undefined) httpParams = httpParams.set('offset', params.offset.toString());

  const idParaFiltrar = params.usuarioId || params.autor;
  if (idParaFiltrar && idParaFiltrar !== 'undefined') {
    httpParams = httpParams.set('usuarioId', idParaFiltrar);
  }

  return this.http.get<any[]>(`${this.baseUrl}/publicaciones`, { params: httpParams });
}

  eliminarPublicacion(id: string, usuarioId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/publicaciones/${id}?usuarioId=${usuarioId}`);
  }

  darMeGusta(id: string, usuarioId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/publicaciones/${id}/like`, { usuarioId });
  }

  quitarMeGusta(id: string, usuarioId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/publicaciones/${id}/like?usuarioId=${usuarioId}`);
  }
}
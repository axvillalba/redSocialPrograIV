import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/usuarios';
 // private apiUrl: 'https://red-social-progra-iv.vercel.app'


 private cloudinaryUrl = 'https://api.cloudinary.com/v1_1/zjcgupxi/image/upload';
 private uploadPreset = 'mi_app_unsigned';
  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearUsuario(datosUsuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosUsuario);
  }

  deshabilitarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  habilitarUsuario(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/habilitar`, {});
  }

  subirImagenCloudinary(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', this.uploadPreset);
    return this.http.post<any>(this.cloudinaryUrl, formData);
  }

  cambiarPerfilUsuario(id: string, perfil: 'usuario' | 'administrador'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/perfil`, { perfil });
  }
}
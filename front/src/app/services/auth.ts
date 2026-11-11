import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/autenticacion/registro`, usuario);
  }

  login(credenciales: { login: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/autenticacion/login`, credenciales);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${id}`);
  }
  actualizarUsuario(id: string, datos: any): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/usuarios/${id}`, datos);
}
}

//Para probar localhost

/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Modificado provisoriamente para apuntar al backend local
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/autenticacion/registro`, usuario);
  }

  login(credenciales: { login: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/autenticacion/login`, credenciales);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${id}`);
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuarios/${id}`, datos);
  }
}
*/
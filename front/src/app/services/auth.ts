import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'hextech_token';
  private readonly USER_KEY = 'usuario';

  // Notifica cuando se inicia o renueva sesión para reiniciar el timer de 10 min
  private sesionActivaSubject = new BehaviorSubject<boolean>(!!this.obtenerToken());
  sesionActiva$ = this.sesionActivaSubject.asObservable();

  constructor(private http: HttpClient) {}

  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/autenticacion/registro`, usuario).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  login(credenciales: { login: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/autenticacion/login`, credenciales).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  autorizar(): Observable<any> {
    const token = this.obtenerToken();
    return this.http.post<any>(`${this.baseUrl}/autenticacion/autorizar`, { token }).pipe(
      tap((res) => {
        if (res?.usuario) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.usuario));
        }
        this.sesionActivaSubject.next(true);
      })
    );
  }

  refrescar(): Observable<any> {
    const token = this.obtenerToken();
    return this.http.post<any>(`${this.baseUrl}/autenticacion/refrescar`, { token }).pipe(
      tap((res) => {
        if (res?.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.sesionActivaSubject.next(true);
        }
      })
    );
  }

guardarSesion(respuesta: any): void {
    if (respuesta?.token) {
      localStorage.setItem(this.TOKEN_KEY, respuesta.token);
    }

    const usuarioServidor = respuesta?.usuario || (respuesta?._id || respuesta?.id ? respuesta : null);
    if (usuarioServidor) {
      const idUsuario = usuarioServidor._id || usuarioServidor.id;
      const usuarioLimpio = {
        _id: idUsuario,
        id: idUsuario,
        nombre: usuarioServidor.nombre || '',
        apellido: usuarioServidor.apellido || '',
        nombreUsuario: usuarioServidor.nombreUsuario || usuarioServidor.login || '',
        correo: usuarioServidor.correo || usuarioServidor.email || '',
        fechaNacimiento: usuarioServidor.fechaNacimiento || '',
        descripcion: usuarioServidor.descripcion || '',
        imagenPerfilUrl: usuarioServidor.imagenPerfilUrl || usuarioServidor.imagenPerfil || '',
        rol: usuarioServidor.rol || 'usuario'
      };

      try {
        localStorage.removeItem(this.USER_KEY);
        localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioLimpio));
      } catch (e) {
        console.error('Error al guardar usuario en localStorage:', e);
      }
    }

    if (respuesta?.token) {
      this.sesionActivaSubject.next(true);
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  obtenerUsuarioActual(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.sesionActivaSubject.next(false);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${id}`);
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuarios/${id}`, datos);
  }
}
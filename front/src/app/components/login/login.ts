import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        // 1. Guardar el token si el backend lo retorna
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        const usuarioServidor = res.usuario || res;
        const idUsuario = usuarioServidor._id || usuarioServidor.id;

        // 2. Crear un objeto ultra-liviano libre de imágenes Base64
        const usuarioLimpio = {
          _id: idUsuario,
          id: idUsuario,
          nombre: usuarioServidor.nombre || '',
          apellido: usuarioServidor.apellido || '',
          nombreUsuario: usuarioServidor.nombreUsuario || usuarioServidor.login || '',
          correo: usuarioServidor.correo || usuarioServidor.email || '',
          rol: usuarioServidor.rol || 'USUARIO'
        };

        // 3. Guardar limpiando cualquier basura previa
        try {
          localStorage.removeItem('usuario');
          localStorage.setItem('usuario', JSON.stringify(usuarioLimpio));
        } catch (e) {
          console.error('Error al guardar usuario en localStorage:', e);
        }

        // 4. Redirigir a publicaciones
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
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
      // Guardar el token si el backend lo devuelve
      if (res.token) {
        localStorage.setItem('token', res.token);
      }

      // Extraer solo los datos esenciales para no saturar el localStorage
      const usuarioLiviano = {
        id: res.usuario?._id || res._id || res.id,
        nombre: res.usuario?.nombre || res.nombre,
        apellido: res.usuario?.apellido || res.apellido,
        usuario: res.usuario?.usuario || res.usuario,
        rol: res.usuario?.rol || res.rol
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioLiviano));
      this.router.navigate(['/publicaciones']);
    },
    error: (err) => {
      this.errorMensaje = err.error?.message || 'Usuario o contraseña incorrectos.';
    }
  });
}
}
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

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMensaje = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        // Guarda el token ('hextech_token'), normaliza 'usuario' y arranca el timer de 10 min
        this.authService.guardarSesion(res);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
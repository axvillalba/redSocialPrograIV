import { ChangeDetectorRef, Component } from '@angular/core';
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
    private router: Router,
    private cdr: ChangeDetectorRef
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
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.authService.guardarSesion(res);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        const msgBackend = err.error?.message;

        if (Array.isArray(msgBackend)) {
          this.errorMensaje = msgBackend.join('. ');
        } else if (typeof msgBackend === 'string' && msgBackend.trim() !== '') {
          this.errorMensaje = msgBackend;
        } else {
          this.errorMensaje = 'Usuario o contraseña incorrectos.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}
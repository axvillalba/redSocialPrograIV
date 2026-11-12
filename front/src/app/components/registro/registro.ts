import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {
  registroForm: FormGroup;
  errorMensaje: string = '';
  subiendoImagen: boolean = false;
  guardando: boolean = false;
  imagenSubidaUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: [''],
      descripcion: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.subiendoImagen = true;

      this.cloudinaryService.subirImagen(file).subscribe({
        next: (url: string) => {
          this.imagenSubidaUrl = url;
          this.subiendoImagen = false;
        },
        error: (err) => {
          console.error('Error al subir avatar a Cloudinary:', err);
          this.subiendoImagen = false;
          alert('No se pudo subir la foto de perfil a Cloudinary.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.registroForm.invalid || this.subiendoImagen || this.guardando) {
      this.registroForm.markAllAsTouched();
      return;
    }

    if (this.registroForm.value.password !== this.registroForm.value.repetirPassword) {
      this.errorMensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMensaje = '';
    this.guardando = true;

    const payload = {
      nombre: this.registroForm.value.nombre,
      apellido: this.registroForm.value.apellido,
      correo: this.registroForm.value.correo,
      nombreUsuario: this.registroForm.value.nombreUsuario,
      password: this.registroForm.value.password,
      fechaNacimiento: this.registroForm.value.fechaNacimiento,
      descripcion: this.registroForm.value.descripcion,
      imagenPerfilUrl: this.imagenSubidaUrl,
      imagenPerfil: this.imagenSubidaUrl
    };

    this.authService.registrar(payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        // Guarda el token JWT devuelto por el backend y los datos del usuario en localStorage
        this.authService.guardarSesion(res);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorMensaje = err.error?.message || 'Ocurrió un error al intentar registrar el usuario.';
        this.guardando = false;
      }
    });
  }
}
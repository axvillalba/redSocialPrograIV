import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
    this.registroForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        correo: ['', [Validators.required, Validators.email]],
        nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
          ]
        ],
        repetirPassword: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        descripcion: ['', [Validators.required, Validators.maxLength(250)]]
      },
      { validators: this.passwordsCoincidenValidator }
    );
  }

  private passwordsCoincidenValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const repetir = group.get('repetirPassword')?.value;
    if (pass && repetir && pass !== repetir) {
      return { passwordsNoCoinciden: true };
    }
    return null;
  }

  campoInvalido(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && (control.touched || control.dirty) && control.invalid);
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
          this.errorMensaje = 'No se pudo subir la foto de perfil a Cloudinary.';
        }
      });
    }
  }

  quitarAvatar(): void {
    this.imagenSubidaUrl = '';
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
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { UsuariosService } from '../../services/usuarios';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.scss'
})
export class DashboardUsuariosComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  usuarios: any[] = [];
  usuarioActualId: string = '';

  cargandoLista: boolean = true;
  guardandoUsuario: boolean = false;
  subiendoImagen: boolean = false;
  procesandoId: string | null = null;

  mensajeExito: string = '';
  mensajeError: string = '';

  archivoSeleccionado: File | null = null;
  imagenPreviewUrl: string | null = null;

  usuarioForm: FormGroup;

  private readonly EMAIL_ESTRICTO_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly AVATAR_POR_DEFECTO =
    'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/29.png';

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: [
        '',
        [Validators.required, Validators.pattern(this.EMAIL_ESTRICTO_REGEX)]
      ],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
        ]
      ],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      perfil: ['usuario', Validators.required]
    });
  }

  ngOnInit(): void {
    const actual = this.authService.obtenerUsuarioActual();
    this.usuarioActualId = actual?._id || actual?.id || '';
    this.cargarUsuarios();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mensajeError = 'Seleccioná un archivo de imagen válido (JPG, PNG, WEBP).';
      this.limpiarImagenSeleccionada();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.mensajeError = 'La imagen no puede superar los 5 MB.';
      this.limpiarImagenSeleccionada();
      return;
    }

    this.mensajeError = '';
    this.archivoSeleccionado = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  limpiarImagenSeleccionada(): void {
    this.archivoSeleccionado = null;
    this.imagenPreviewUrl = null;
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  cargarUsuarios(): void {
    this.cargandoLista = true;
    this.cdr.detectChanges();

    this.usuariosService.listarUsuarios().subscribe({
      next: (lista) => {
        this.usuarios = lista;
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al listar usuarios:', err);
        this.mensajeError = err.error?.message || 'No se pudo cargar el listado de usuarios.';
        this.cargandoLista = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.guardandoUsuario = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();

    if (this.archivoSeleccionado) {
      this.subiendoImagen = true;
      this.cdr.detectChanges();

      this.usuariosService.subirImagenCloudinary(this.archivoSeleccionado).subscribe({
        next: (resCloudinary) => {
          this.subiendoImagen = false;
          const urlFinal = resCloudinary?.secure_url || this.AVATAR_POR_DEFECTO;
          this.enviarAltaAlBackend(urlFinal);
        },
        error: (err) => {
          console.error('Error al subir imagen a Cloudinary:', err);
          this.subiendoImagen = false;
          this.guardandoUsuario = false;
          this.mensajeError = 'No se pudo subir la imagen a Cloudinary. Revisá el preset o intentá de nuevo.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.enviarAltaAlBackend(this.AVATAR_POR_DEFECTO);
    }
  }

  private enviarAltaAlBackend(imagenPerfilUrl: string): void {
    const payload = {
      ...this.usuarioForm.value,
      correo: this.usuarioForm.value.correo.trim().toLowerCase(),
      nombreUsuario: this.usuarioForm.value.nombreUsuario.trim().toLowerCase(),
      imagenPerfilUrl
    };

    this.usuariosService.crearUsuario(payload).subscribe({
      next: (nuevoUsuario) => {
        this.usuarios = [nuevoUsuario, ...this.usuarios];
        this.usuarioForm.reset({ perfil: 'usuario' });
        this.limpiarImagenSeleccionada();
        this.mensajeExito = `Invocador @${nuevoUsuario.nombreUsuario} registrado con rol ${nuevoUsuario.perfil.toUpperCase()}.`;
        this.guardandoUsuario = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.mensajeError = Array.isArray(msg) ? msg.join('. ') : msg || 'Error al crear el usuario.';
        this.guardandoUsuario = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarRolUsuario(usuario: any): void {
    const id = usuario._id || usuario.id;
    if (!id || this.procesandoId || id === this.usuarioActualId) return;

    const nuevoPerfil: 'usuario' | 'administrador' =
      usuario.perfil === 'administrador' ? 'usuario' : 'administrador';

    this.procesandoId = id;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();

    this.usuariosService.cambiarPerfilUsuario(id, nuevoPerfil).subscribe({
      next: (actualizado) => {
        const idx = this.usuarios.findIndex((u) => (u._id || u.id) === id);
        if (idx !== -1) {
          this.usuarios[idx] = { ...this.usuarios[idx], perfil: actualizado.perfil };
        }
        this.mensajeExito =
          actualizado.perfil === 'administrador'
            ? `@${usuario.nombreUsuario} ahora tiene permisos de ADMINISTRADOR.`
            : `@${usuario.nombreUsuario} volvió al rol USUARIO.`;
        this.procesandoId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al cambiar el perfil del usuario.';
        this.procesandoId = null;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEstadoUsuario(usuario: any): void {
    const id = usuario._id || usuario.id;
    if (!id || this.procesandoId || id === this.usuarioActualId) return;

    this.procesandoId = id;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();

    const peticion$ =
      usuario.activo !== false
        ? this.usuariosService.deshabilitarUsuario(id)
        : this.usuariosService.habilitarUsuario(id);

    peticion$.subscribe({
      next: (actualizado) => {
        const idx = this.usuarios.findIndex((u) => (u._id || u.id) === id);
        if (idx !== -1) {
          this.usuarios[idx] = { ...this.usuarios[idx], activo: actualizado.activo };
        }
        this.mensajeExito = actualizado.activo
          ? `Usuario @${usuario.nombreUsuario} habilitado nuevamente.`
          : `Usuario @${usuario.nombreUsuario} deshabilitado.`;
        this.procesandoId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al actualizar el estado del usuario.';
        this.procesandoId = null;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerAvatar(usuario: any): string {
    return (
      usuario?.imagenPerfilUrl ||
      usuario?.imagenPerfil ||
      this.AVATAR_POR_DEFECTO
    );
  }
}
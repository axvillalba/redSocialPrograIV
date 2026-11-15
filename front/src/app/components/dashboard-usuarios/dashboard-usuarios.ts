import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  usuarios: any[] = [];
  usuarioActualId: string = '';

  cargandoLista: boolean = true;
  guardandoUsuario: boolean = false;
  procesandoId: string | null = null;

  mensajeExito: string = '';
  mensajeError: string = '';

  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
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
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      imagenPerfilUrl: [''],
      perfil: ['usuario', Validators.required]
    });
  }

  ngOnInit(): void {
    const actual = this.authService.obtenerUsuarioActual();
    this.usuarioActualId = actual?._id || actual?.id || '';
    this.cargarUsuarios();
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

    const payload = {
      ...this.usuarioForm.value,
      imagenPerfilUrl:
        this.usuarioForm.value.imagenPerfilUrl?.trim() ||
        'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/29.png'
    };

    this.usuariosService.crearUsuario(payload).subscribe({
      next: (nuevoUsuario) => {
        this.usuarios = [nuevoUsuario, ...this.usuarios];
        this.usuarioForm.reset({ perfil: 'usuario' });
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
      'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/29.png'
    );
  }
}
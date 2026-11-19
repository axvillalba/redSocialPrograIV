import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth';
import { ModalComponent } from './components/modal/modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  mostrarModalSesion = false;
  segundosRestantes = 30;

  private timerAvisoModal: any = null;
  private intervaloCuentaRegresiva: any = null;
  private sesionSub?: Subscription;

  // El modal aparece exactamente 30 segundos antes de que venza el JWT
  private readonly MARGEN_AVISO_MS = 30 * 1000;


  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sesionSub = this.authService.sesionActiva$.subscribe((activa) => {
      if (activa) {
        this.programarAvisoDesdeToken();
      } else {
        this.limpiarContadoresSesion();
        this.mostrarModalSesion = false;
        this.cdr.detectChanges();
      }
    });
  }

  private obtenerExpiracionMs(token: string): number | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private programarAvisoDesdeToken(): void {
    this.limpiarContadoresSesion();
    const token = this.authService.obtenerToken();
    if (!token) return;

    const expMs = this.obtenerExpiracionMs(token);
    if (!expMs) return;

    const tiempoRestanteMs = expMs - Date.now();
    const tiempoHastaAvisoMs = tiempoRestanteMs - this.MARGEN_AVISO_MS;

    // Si el token ya venció, no se expulsa acá: queda esperando que el usuario
    // haga una acción para que el backend responda 401 y el interceptor lo redirija.
    if (tiempoRestanteMs <= 0) {
      return;
    }

    if (tiempoHastaAvisoMs <= 0) {
      this.mostrarModalSesion = true;
      this.iniciarCuentaRegresivaVisual(expMs);
      this.cdr.detectChanges();
      return;
    }

    // Programar la aparición del modal 30 segundos antes de expMs
    this.timerAvisoModal = setTimeout(() => {
      if (this.authService.obtenerToken()) {
        this.mostrarModalSesion = true;
        this.iniciarCuentaRegresivaVisual(expMs);
        this.cdr.detectChanges();
      }
    }, tiempoHastaAvisoMs);
  }

  private iniciarCuentaRegresivaVisual(expMs: number): void {
    this.detenerCuentaRegresivaVisual();

    const actualizar = () => {
      const restante = Math.max(0, Math.ceil((expMs - Date.now()) / 1000));
      this.segundosRestantes = restante;

      if (restante <= 0) {
        // Cuando llegan a 0 los 30s, se cierra el modal de alerta pero NO se redirige al login.
        // El usuario sigue en pantalla hasta que intente realizar una acción y reciba 401.
        this.detenerCuentaRegresivaVisual();
        this.mostrarModalSesion = false;
      }

      this.cdr.detectChanges();
    };

    actualizar();
    this.intervaloCuentaRegresiva = setInterval(actualizar, 250);
  }

  private detenerCuentaRegresivaVisual(): void {
    if (this.intervaloCuentaRegresiva) {
      clearInterval(this.intervaloCuentaRegresiva);
      this.intervaloCuentaRegresiva = null;
    }
  }

  private limpiarContadoresSesion(): void {

    if (this.timerAvisoModal) {
      clearTimeout(this.timerAvisoModal);
      this.timerAvisoModal = null;
    }
    this.detenerCuentaRegresivaVisual();
  }

  extenderSesion(): void {
    this.limpiarContadoresSesion();
    this.mostrarModalSesion = false;
    this.cdr.detectChanges();

    this.authService.refrescar().subscribe({
      next: () => {
        // sesionActiva$ emite true y reprograma el próximo aviso por otros 15 minutos
      },
      error: (err) => {
        // Si justo venció antes de hacer clic en Extender, el backend devuelve 401
        console.error('Error al extender sesión (token expirado):', err);
      }
    });
  }

  rechazarExtension(): void {
    this.limpiarContadoresSesion();
    this.mostrarModalSesion = false;
    this.cdr.detectChanges();
  }


  ngOnDestroy(): void {
    this.limpiarContadoresSesion();
    this.sesionSub?.unsubscribe();
  }
}
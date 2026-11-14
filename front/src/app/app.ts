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
  private timerSesion: any = null;
  private sesionSub?: Subscription;

  // Aviso exactamente 30 segundos antes de que expire el JWT
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
        this.limpiarContadorSesion();
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
    this.limpiarContadorSesion();
    const token = this.authService.obtenerToken();
    if (!token) return;

    const expMs = this.obtenerExpiracionMs(token);
    if (!expMs) return;

    const tiempoRestanteMs = expMs - Date.now();
    const tiempoHastaAvisoMs = tiempoRestanteMs - this.MARGEN_AVISO_MS;

    if (tiempoRestanteMs <= 0) {
      // Ya expiró
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
      return;
    }

    if (tiempoHastaAvisoMs <= 0) {
      // Faltan 30 segundos o menos: mostrar aviso de inmediato
      this.mostrarModalSesion = true;
      this.cdr.detectChanges();
      return;
    }

    this.timerSesion = setTimeout(() => {
      if (this.authService.obtenerToken()) {
        this.mostrarModalSesion = true;
        this.cdr.detectChanges();
      }
    }, tiempoHastaAvisoMs);
  }

  private limpiarContadorSesion(): void {
    if (this.timerSesion) {
      clearTimeout(this.timerSesion);
      this.timerSesion = null;
    }
  }

  extenderSesion(): void {
    this.mostrarModalSesion = false;
    this.cdr.detectChanges();

    this.authService.refrescar().subscribe({
      next: () => {
        // Al guardar el nuevo token, sesionActiva$ reprograma el aviso a exp - 30s
      },
      error: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  rechazarExtension(): void {
    this.mostrarModalSesion = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.limpiarContadorSesion();
    this.sesionSub?.unsubscribe();
  }
}
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

  // Temporal para revisión: 30 segundos (valor final de entrega: 10 * 60 * 1000)
  private readonly TIEMPO_AVISO_MS = 30 * 1000;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sesionSub = this.authService.sesionActiva$.subscribe((activa) => {
      if (activa) {
        this.iniciarContadorSesion();
      } else {
        this.limpiarContadorSesion();
        this.mostrarModalSesion = false;
        this.cdr.detectChanges();
      }
    });
  }

  private iniciarContadorSesion(): void {
    this.limpiarContadorSesion();
    this.timerSesion = setTimeout(() => {
      if (this.authService.obtenerToken()) {
        this.mostrarModalSesion = true;
        this.cdr.detectChanges(); // Fuerza a mostrar el modal en modo zoneless
      }
    }, this.TIEMPO_AVISO_MS);
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
        // sesionActiva$ reinicia el contador de 30s automáticamente
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
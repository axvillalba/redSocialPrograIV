import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
import { NavbarComponent } from '../navbar/navbar';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.scss',
})
export class DashboardEstadisticasComponent implements OnInit, OnDestroy {
  @ViewChild('chartPubsUsuario') chartPubsUsuarioRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentariosTiempo') chartComentariosTiempoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentariosPub') chartComentariosPubRef!: ElementRef<HTMLCanvasElement>;

  fechaDesde: string = '';
  fechaHasta: string = '';
  rangoActivo: '7d' | '30d' | 'todo' | 'custom' = '30d';

  cargando: boolean = true;
  errorMensaje: string = '';

  datosPubsPorUsuario: any[] = [];
  datosComentariosPorTiempo: any[] = [];
  datosComentariosPorPub: any[] = [];

  private chartBarras?: Chart;
  private chartLineas?: Chart;
  private chartTorta?: Chart;

  constructor(
    private publicacionesService: PublicacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aplicarRangoRapido('30d');
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  get totalPublicacionesRango(): number {
    return this.datosPubsPorUsuario.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  }

  get totalComentariosRango(): number {
    return this.datosComentariosPorTiempo.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  }

  get publicacionMasComentada(): string {
    if (!this.datosComentariosPorPub.length) return 'Sin datos';
    const top = this.datosComentariosPorPub[0];
    return top.cantidadComentarios > 0
      ? `${top.titulo} (${top.cantidadComentarios})`
      : 'Sin comentarios';
  }

  aplicarRangoRapido(rango: '7d' | '30d' | 'todo'): void {
    this.rangoActivo = rango;
    const hoy = new Date();

    if (rango === 'todo') {
      this.fechaDesde = '';
      this.fechaHasta = '';
    } else {
      const dias = rango === '7d' ? 7 : 30;
      const inicio = new Date();
      inicio.setDate(hoy.getDate() - dias);

      this.fechaDesde = this.formatearFechaInput(inicio);
      this.fechaHasta = this.formatearFechaInput(hoy);
    }

    this.cargarEstadisticas();
  }

  filtrarPersonalizado(): void {
    this.rangoActivo = 'custom';
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.errorMensaje = '';
    this.cdr.detectChanges();

    const desde = this.fechaDesde || undefined;
    const hasta = this.fechaHasta || undefined;

    forkJoin({
      pubsUsuario: this.publicacionesService.obtenerEstadisticaPublicacionesPorUsuario(desde, hasta),
      comentariosTiempo: this.publicacionesService.obtenerEstadisticaComentariosPorTiempo(desde, hasta),
      comentariosPub: this.publicacionesService.obtenerEstadisticaComentariosPorPublicacion(desde, hasta),
    }).subscribe({
      next: (res) => {
        this.datosPubsPorUsuario = res.pubsUsuario || [];
        this.datosComentariosPorTiempo = res.comentariosTiempo || [];
        this.datosComentariosPorPub = res.comentariosPub || [];

        this.cargando = false;
        this.cdr.detectChanges();

        // Esperar un ciclo mínimo para asegurar que los <canvas> estén montados en el DOM
        setTimeout(() => this.renderizarGraficos(), 0);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.errorMensaje = err.error?.message || 'No se pudieron obtener las estadísticas.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private destruirGraficos(): void {
    this.chartBarras?.destroy();
    this.chartLineas?.destroy();
    this.chartTorta?.destroy();
  }

  private renderizarGraficos(): void {
    this.destruirGraficos();

    // 1. GRÁFICO DE BARRAS: Publicaciones por usuario
    if (this.chartPubsUsuarioRef?.nativeElement && this.datosPubsPorUsuario.length > 0) {
      this.chartBarras = new Chart(this.chartPubsUsuarioRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.datosPubsPorUsuario.map((d) => `@${d.nombreUsuario}`),
          datasets: [
            {
              label: 'Publicaciones realizadas',
              data: this.datosPubsPorUsuario.map((d) => d.cantidad),
              backgroundColor: 'rgba(0, 207, 200, 0.45)',
              borderColor: '#00cfc8',
              borderWidth: 2,
              borderRadius: 4,
              hoverBackgroundColor: 'rgba(0, 207, 200, 0.75)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#f0e6d2' } },
          },
          scales: {
            x: {
              ticks: { color: '#cdbe91' },
              grid: { color: 'rgba(120, 90, 40, 0.18)' },
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#cdbe91', stepSize: 1 },
              grid: { color: 'rgba(120, 90, 40, 0.18)' },
            },
          },
        },
      });
    }

    // 2. GRÁFICO DE LÍNEAS: Comentarios realizados en un lapso de tiempo
    if (this.chartComentariosTiempoRef?.nativeElement && this.datosComentariosPorTiempo.length > 0) {
      this.chartLineas = new Chart(this.chartComentariosTiempoRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.datosComentariosPorTiempo.map((d) => d.fecha),
          datasets: [
            {
              label: 'Comentarios por día',
              data: this.datosComentariosPorTiempo.map((d) => d.cantidad),
              borderColor: '#c8aa6e',
              backgroundColor: 'rgba(200, 170, 110, 0.2)',
              pointBackgroundColor: '#00cfc8',
              pointBorderColor: '#010a13',
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#f0e6d2' } },
          },
          scales: {
            x: {
              ticks: { color: '#cdbe91' },
              grid: { color: 'rgba(120, 90, 40, 0.18)' },
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#cdbe91', stepSize: 1 },
              grid: { color: 'rgba(120, 90, 40, 0.18)' },
            },
          },
        },
      });
    }

    // 3. GRÁFICO DE TORTA / DONA: Comentarios por publicación
    if (this.chartComentariosPubRef?.nativeElement && this.datosComentariosPorPub.length > 0) {
      const topPublicaciones = this.datosComentariosPorPub.slice(0, 8);
      const paletaArcane = [
        '#00cfc8',
        '#c8aa6e',
        '#e84057',
        '#9b59b6',
        '#3498db',
        '#2ecc71',
        '#f39c12',
        '#1abc9c',
      ];

      this.chartTorta = new Chart(this.chartComentariosPubRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: topPublicaciones.map((d) =>
            d.titulo.length > 26 ? `${d.titulo.slice(0, 26)}...` : d.titulo
          ),
          datasets: [
            {
              label: 'Comentarios',
              data: topPublicaciones.map((d) => d.cantidadComentarios),
              backgroundColor: paletaArcane,
              borderColor: '#030a16',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#f0e6d2', padding: 14 },
            },
          },
        },
      });
    }
  }

  private formatearFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
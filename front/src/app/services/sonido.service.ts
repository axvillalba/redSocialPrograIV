import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SonidoService {
  private readonly MUTE_KEY = 'hextech_sonido_activo';
  private activo = localStorage.getItem(this.MUTE_KEY) === 'true';
  private ctx: AudioContext | null = null;

  estaActivo(): boolean {
    return this.activo;
  }

  alternarSonido(): boolean {
    this.activo = !this.activo;
    localStorage.setItem(this.MUTE_KEY, String(this.activo));
    if (this.activo) {
      this.reproducirClicHextech();
    }
    return this.activo;
  }

  private obtenerContexto(): AudioContext | null {
    if (!this.activo) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Sonido cristalino para botones y likes (Prender / Claridad)
  reproducirClicHextech(): void {
    const ctx = this.obtenerContexto();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  // Sonido de teletransporte dorado para el botón Destello (Flash)
  reproducirDestello(): void {
    const ctx = this.obtenerContexto();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // Pulso grave de advertencia para el contador de 30s del token
  reproducirAlertaToken(): void {
    const ctx = this.obtenerContexto();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  }
}
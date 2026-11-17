import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHextechGlow]',
  standalone: true,
})
export class HextechGlowDirective {
  @Input('appHextechGlow') colorResplandor: 'cian' | 'dorado' | '' = 'cian';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease'
    );
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const color = this.colorResplandor === 'dorado' ? '#c8aa6e' : '#00cfc8';
    const sombra =
      this.colorResplandor === 'dorado'
        ? '0 0 18px rgba(200, 170, 110, 0.35)'
        : '0 0 18px rgba(0, 207, 200, 0.35)';

    this.renderer.setStyle(this.el.nativeElement, 'borderColor', color);
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', sombra);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'borderColor');
    this.renderer.removeStyle(this.el.nativeElement, 'boxShadow');
  }
}
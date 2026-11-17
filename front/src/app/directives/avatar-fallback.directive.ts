import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appAvatarFallback]',
  standalone: true,
})
export class AvatarFallbackDirective {
  @Input() appAvatarFallback: string =
    'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/29.png';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onImageError(): void {
    const img = this.el.nativeElement;
    if (img.src !== this.appAvatarFallback) {
      img.src = this.appAvatarFallback;
    }
  }
}
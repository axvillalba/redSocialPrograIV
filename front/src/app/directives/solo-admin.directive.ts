import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true,
})
export class SoloAdminDirective implements OnInit {
  private yaRenderizado = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.esAdministrador() && !this.yaRenderizado) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.yaRenderizado = true;
    } else if (!this.authService.esAdministrador()) {
      this.viewContainer.clear();
      this.yaRenderizado = false;
    }
  }
}
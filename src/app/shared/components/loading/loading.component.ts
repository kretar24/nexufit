import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div class="animate-spin rounded-full border-b-2 border-primary-500" [ngClass]="spinnerClass"></div>
      <p *ngIf="message" class="ml-3 text-secondary-600" [ngClass]="textClass">
        {{ message }}
      </p>
    </div>
  `
})
export class LoadingComponent {
  @Input() message: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() containerClass: string = '';

  get spinnerClass(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12'
    };
    return sizes[this.size];
  }

  get textClass(): string {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return sizes[this.size];
  }
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      <div class="mx-auto h-12 w-12 text-secondary-400 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-full h-full">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" [attr.d]="iconPath" />
        </svg>
      </div>
      <h3 class="mt-2 text-sm font-medium text-secondary-900">{{ title }}</h3>
      <p class="mt-1 text-sm text-secondary-500">{{ description }}</p>
      <div class="mt-6" *ngIf="showAction">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'No hay elementos';
  @Input() description: string = 'Comienza creando un nuevo elemento.';
  @Input() icon: string = 'inbox';
  @Input() showAction: boolean = true;

  get iconPath(): string {
    const icons: { [key: string]: string } = {
      inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      payment: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    };
    return icons[this.icon] || icons.inbox;
  }
}
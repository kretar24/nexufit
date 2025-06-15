import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NotificationComponent],
  template: `
    <main class="min-h-screen bg-neutral-50">
      <router-outlet></router-outlet>
      <app-notification></app-notification>
    </main>
  `
})
export class AppComponent {
  constructor(private notificationService: NotificationService) {}
}
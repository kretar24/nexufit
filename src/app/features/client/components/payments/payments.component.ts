import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Payment } from '../../../../core/interfaces/payment.interface';
import { User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent, EmptyStateComponent],
  standalone: true,
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  currentUser: User | null = null;
  payments: Payment[] = [];
  isLoading = true;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserPayments();
  }

  loadUserPayments(): void {
    if (this.currentUser) {
      this.paymentService.getUserPayments(this.currentUser.id).subscribe({
        next: (payments) => {
          this.payments = payments.sort((a, b) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Error', 'No se pudieron cargar los pagos');
          this.isLoading = false;
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'verified':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'rejected':
        return 'badge badge-error';
      default:
        return 'badge badge-info';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'verified':
        return 'Verificado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }

  getMethodText(method: string): string {
    switch (method) {
      case 'transfer':
        return 'Transferencia';
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      default:
        return method;
    }
  }
}
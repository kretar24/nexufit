import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Payment } from '../../../../core/interfaces/payment.interface';
import { User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  users: User[] = [];
  filteredPayments: Payment[] = [];
  isLoading = true;
  filterStatus: 'all' | 'pending' | 'verified' | 'rejected' = 'all';

  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load payments and users
    Promise.all([
      this.paymentService.getPayments().toPromise(),
      this.userService.getUsers().toPromise()
    ]).then(([payments, users]) => {
      this.payments = payments || [];
      this.users = users || [];
      this.applyFilters();
      this.isLoading = false;
    }).catch(error => {
      this.notificationService.error('Error', 'No se pudieron cargar los datos');
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    let filtered = [...this.payments];

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === this.filterStatus);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    this.filteredPayments = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  }

  verifyPayment(payment: Payment): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.paymentService.verifyPayment(payment.id, currentUser.id).subscribe({
      next: (updatedPayment) => {
        const index = this.payments.findIndex(p => p.id === payment.id);
        if (index !== -1) {
          this.payments[index] = updatedPayment;
        }
        this.applyFilters();
        this.notificationService.success('Pago verificado', 'El pago ha sido verificado correctamente');
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudo verificar el pago');
      }
    });
  }

  rejectPayment(payment: Payment): void {
    const reason = prompt('Motivo del rechazo (opcional):');
    
    this.paymentService.rejectPayment(payment.id, reason || undefined).subscribe({
      next: (updatedPayment) => {
        const index = this.payments.findIndex(p => p.id === payment.id);
        if (index !== -1) {
          this.payments[index] = updatedPayment;
        }
        this.applyFilters();
        this.notificationService.success('Pago rechazado', 'El pago ha sido rechazado');
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudo rechazar el pago');
      }
    });
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
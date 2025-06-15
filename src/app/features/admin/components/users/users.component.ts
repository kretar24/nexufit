import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, EmptyStateComponent, LoadingComponent],
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  searchTerm = '';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter(u => u.role === 'client'); // Only show clients
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudieron cargar los usuarios');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        this.filterStatus === 'active' ? user.isActive : !user.isActive
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivateUser' : 'activateUser';
    const actionText = user.isActive ? 'desactivar' : 'activar';

    this.userService[action](user.id).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.notificationService.success(
          'Usuario actualizado',
          `El usuario ${user.name} ha sido ${user.isActive ? 'activado' : 'desactivado'}`
        );
        this.applyFilters();
      },
      error: (error) => {
        this.notificationService.error('Error', `No se pudo ${actionText} el usuario`);
      }
    });
  }

  getStatusBadgeClass(user: User): string {
    if (user.isActive) {
      return 'badge badge-success';
    }
    return 'badge badge-error';
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'overdue':
        return 'badge badge-error';
      default:
        return 'badge badge-info';
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'Al día';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Desconocido';
    }
  }
}
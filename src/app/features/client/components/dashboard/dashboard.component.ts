import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../../core/services/class.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FitnessClass } from '../../../../core/interfaces/class.interface';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  weeklyClasses: FitnessClass[] = [];
  userBookings: string[] = [];
  isLoading = true;

  constructor(
    private classService: ClassService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadWeeklyClasses();
    this.loadUserBookings();
  }

  loadWeeklyClasses(): void {
    this.classService.getWeeklyClasses().subscribe({
      next: (classes) => {
        this.weeklyClasses = classes;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudieron cargar las clases');
        this.isLoading = false;
      }
    });
  }

  loadUserBookings(): void {
    if (this.currentUser) {
      this.classService.getUserBookings(this.currentUser.id).subscribe({
        next: (bookings) => {
          this.userBookings = bookings.map(b => b.classId);
        }
      });
    }
  }

  bookClass(classId: string): void {
    if (!this.currentUser) return;

    this.classService.bookClass(classId, this.currentUser.id).subscribe({
      next: () => {
        this.notificationService.success('¡Reservado!', 'Te has inscrito a la clase correctamente');
        this.loadWeeklyClasses();
        this.loadUserBookings();
      },
      error: (error) => {
        this.notificationService.error('Error', error.message || 'No se pudo realizar la reserva');
      }
    });
  }

  cancelBooking(classId: string): void {
    if (!this.currentUser) return;

    this.classService.cancelBooking(classId, this.currentUser.id).subscribe({
      next: () => {
        this.notificationService.success('Cancelado', 'Has cancelado tu reserva');
        this.loadWeeklyClasses();
        this.loadUserBookings();
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudo cancelar la reserva');
      }
    });
  }

  isUserBooked(classId: string): boolean {
    return this.userBookings.includes(classId);
  }

  canBook(fitnessClass: FitnessClass): boolean {
    return fitnessClass.currentCapacity < fitnessClass.maxCapacity && !this.isUserBooked(fitnessClass.id);
  }

  getOccupancyPercentage(fitnessClass: FitnessClass): number {
    return Math.round((fitnessClass.currentCapacity / fitnessClass.maxCapacity) * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }
}
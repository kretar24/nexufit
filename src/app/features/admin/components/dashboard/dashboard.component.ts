import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { ClassService } from '../../../../core/services/class.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { AdminDashboardStats } from '../../../../core/interfaces/dashboard.interface';
import { FitnessClass } from '../../../../core/interfaces/class.interface';
import { Payment } from '../../../../core/interfaces/payment.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: AdminDashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    todayClasses: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalCapacityToday: 0,
    bookedSlotsToday: 0
  };
  
  todayClasses: FitnessClass[] = [];
  pendingPayments: Payment[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private classService: ClassService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load user stats
    const userStats = this.userService.getUserStats();
    this.stats.totalUsers = userStats.totalUsers;
    this.stats.activeUsers = userStats.activeUsers;
    this.stats.inactiveUsers = userStats.inactiveUsers;

    // Load today's classes
    this.classService.getTodayClasses().subscribe({
      next: (classes) => {
        this.todayClasses = classes;
        this.stats.todayClasses = classes.length;
        this.stats.totalCapacityToday = classes.reduce((sum, c) => sum + c.maxCapacity, 0);
        this.stats.bookedSlotsToday = classes.reduce((sum, c) => sum + c.currentCapacity, 0);
      }
    });

    // Load pending payments
    this.paymentService.getPendingPayments().subscribe({
      next: (payments) => {
        this.pendingPayments = payments;
        this.stats.pendingPayments = payments.length;
      }
    });

    // Load payment stats
    this.paymentService.getPaymentStats().subscribe({
      next: (paymentStats) => {
        this.stats.monthlyRevenue = paymentStats.monthlyRevenue;
        this.isLoading = false;
      }
    });
  }

  getOccupancyPercentage(fitnessClass: FitnessClass): number {
    return Math.round((fitnessClass.currentCapacity / fitnessClass.maxCapacity) * 100);
  }

  getTotalOccupancyPercentage(): number {
    if (this.stats.totalCapacityToday === 0) return 0;
    return Math.round((this.stats.bookedSlotsToday / this.stats.totalCapacityToday) * 100);
  }
}
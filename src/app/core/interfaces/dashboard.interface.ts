export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  todayClasses: number;
  pendingPayments: number;
  monthlyRevenue: number;
  totalCapacityToday: number;
  bookedSlotsToday: number;
}

export interface ClientDashboardData {
  upcomingClasses: FitnessClass[];
  userBookings: ClassBooking[];
  paymentStatus: 'paid' | 'pending' | 'overdue';
  attendanceThisMonth: number;
  nextPaymentDue?: Date;
}

import { FitnessClass } from './class.interface';
import { ClassBooking } from './class.interface';
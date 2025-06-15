export interface FitnessClass {
  id: string;
  name: string;
  description?: string;
  date: Date;
  startTime: string;
  duration: number; // minutes
  maxCapacity: number;
  currentCapacity: number;
  instructorName: string;
  enrolledUsers: string[]; // user IDs
  isActive: boolean;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  date: Date;
  startTime: string;
  duration: number;
  maxCapacity: number;
  instructorName: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  date?: Date;
  startTime?: string;
  duration?: number;
  maxCapacity?: number;
  instructorName?: string;
}

export interface ClassBooking {
  id: string;
  classId: string;
  userId: string;
  bookingDate: Date;
  status: 'confirmed' | 'cancelled';
}
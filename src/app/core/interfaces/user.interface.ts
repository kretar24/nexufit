export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  birthDate?: Date;
  profilePhoto?: string;
  role: 'admin' | 'client';
  isActive: boolean;
  registrationDate: Date;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: Date;
  attendanceCount: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: Date;
  role: 'admin' | 'client';
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  birthDate?: Date;
  profilePhoto?: string;
}
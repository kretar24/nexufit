import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  // Mock data
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@fitreserva.com',
      name: 'Admin Principal',
      role: 'admin',
      isActive: true,
      registrationDate: new Date('2024-01-01'),
      paymentStatus: 'paid',
      attendanceCount: 0
    },
    {
      id: '2',
      email: 'cliente@fitreserva.com',
      name: 'Juan Pérez',
      phone: '+34 666 777 888',
      role: 'client',
      isActive: true,
      registrationDate: new Date('2024-01-15'),
      paymentStatus: 'paid',
      attendanceCount: 12,
      lastPaymentDate: new Date('2024-01-01')
    },
    {
      id: '3',
      email: 'maria@example.com',
      name: 'María García',
      phone: '+34 666 555 444',
      role: 'client',
      isActive: true,
      registrationDate: new Date('2024-01-20'),
      paymentStatus: 'pending',
      attendanceCount: 8,
      lastPaymentDate: new Date('2023-12-15')
    },
    {
      id: '4',
      email: 'carlos@example.com',
      name: 'Carlos López',
      phone: '+34 666 333 222',
      role: 'client',
      isActive: false,
      registrationDate: new Date('2024-01-05'),
      paymentStatus: 'overdue',
      attendanceCount: 3,
      lastPaymentDate: new Date('2023-11-20')
    }
  ];

  constructor() {
    this.usersSubject.next(this.mockUsers);
  }

  getUsers(): Observable<User[]> {
    return of(this.mockUsers);
  }

  getUserById(id: string): Observable<User | undefined> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      email: request.email,
      name: request.name,
      phone: request.phone,
      birthDate: request.birthDate,
      role: request.role,
      isActive: true,
      registrationDate: new Date(),
      paymentStatus: 'pending',
      attendanceCount: 0
    };

    this.mockUsers.push(newUser);
    this.usersSubject.next(this.mockUsers);
    return of(newUser);
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<User> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      ...request
    };

    this.usersSubject.next(this.mockUsers);
    return of(this.mockUsers[userIndex]);
  }

  deactivateUser(id: string): Observable<void> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.mockUsers[userIndex].isActive = false;
      this.usersSubject.next(this.mockUsers);
    }
    return of();
  }

  activateUser(id: string): Observable<void> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.mockUsers[userIndex].isActive = true;
      this.usersSubject.next(this.mockUsers);
    }
    return of();
  }

  getUserStats() {
    const totalUsers = this.mockUsers.length;
    const activeUsers = this.mockUsers.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers
    };
  }
}
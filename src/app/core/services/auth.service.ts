import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users for demonstration
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
    }
  ];

  constructor(private router: Router) {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock authentication
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (user && this.validatePassword(credentials.password)) {
      const authResponse: AuthResponse = {
        user,
        token: 'mock-jwt-token-' + user.id
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', authResponse.token);
      this.currentUserSubject.next(user);
      
      return of(authResponse);
    }
    
    throw new Error('Credenciales inválidas');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || false;
  }

  private validatePassword(password: string): boolean {
    // In a real app, this would validate against a hashed password
    return password === 'password123';
  }
}
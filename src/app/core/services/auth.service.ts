import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase-client';


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

  constructor(private supabase: SupabaseService, private router: Router) {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  async login(credentials: LoginRequest) {
    const result = await this.supabase.signIn(credentials.email, credentials.password);
    if (result.error) {
      console.error(result.error);
      alert('Error al iniciar sesión');
    } else {
      const user = result.data.user;
      alert('Inicio de sesión exitoso');
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    return result;
  }

  logout() {
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
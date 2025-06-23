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
  private currentUserSubject = new BehaviorSubject<any | null>(null);
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
      const companyId = await this.supabase.getUserCompany();
      const userParams = await this.supabase.getUserParams(companyId);
      localStorage.setItem('companyId', companyId.toString());
      localStorage.setItem('AdminUser', userParams[0].adminuser)
      
      // Guardar toda la información del usuario
      const userInfo = {
        ...user,
        companyId,
        params: userParams
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      this.currentUserSubject.next(userInfo);
      alert('Inicio de sesión exitoso');
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
    const isAdmin = localStorage.getItem('AdminUser');
    return isAdmin === 'true' || false;
  }

  private validatePassword(password: string): boolean {
    // In a real app, this would validate against a hashed password
    return password === 'password123';
  }
}
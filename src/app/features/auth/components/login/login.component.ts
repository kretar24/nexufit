import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // If already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        this.authService.login(this.loginForm.value).subscribe({
          next: (response) => {
            this.notificationService.success(
              'Bienvenido',
              `Hola ${response.user.name}, has iniciado sesión correctamente.`
            );
            this.redirectUser();
          },
          error: (error) => {
            this.notificationService.error(
              'Error de autenticación',
              'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
            );
            this.isLoading = false;
          }
        });
      } catch (error) {
        this.notificationService.error(
          'Error de autenticación',
          'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
        );
        this.isLoading = false;
      }
    }
  }

  private redirectUser(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/client/dashboard']);
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
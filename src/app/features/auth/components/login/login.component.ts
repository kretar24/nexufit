import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
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

  ngOnInit() {
    // If already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  async onSubmit() {
    debugger;
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        const result = await this.authService.login(this.loginForm.value);
        if (result) {
          this.redirectUser();
        }
      } catch (error) {
        alert('Error al iniciar sesión');
      } finally {
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
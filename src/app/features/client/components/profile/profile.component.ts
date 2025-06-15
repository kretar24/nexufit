import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      birthDate: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        phone: this.currentUser.phone || '',
        birthDate: this.currentUser.birthDate ? new Date(this.currentUser.birthDate).toISOString().split('T')[0] : ''
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser && !this.isLoading) {
      this.isLoading = true;
      
      const updateData = {
        name: this.profileForm.value.name,
        phone: this.profileForm.value.phone || undefined,
        birthDate: this.profileForm.value.birthDate ? new Date(this.profileForm.value.birthDate) : undefined
      };

      this.userService.updateUser(this.currentUser.id, updateData).subscribe({
        next: (updatedUser) => {
          this.notificationService.success('Perfil actualizado', 'Tus datos han sido actualizados correctamente');
          this.currentUser = updatedUser;
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Error', 'No se pudo actualizar el perfil');
          this.isLoading = false;
        }
      });
    }
  }

  get name() { return this.profileForm.get('name'); }
  get phone() { return this.profileForm.get('phone'); }
  get birthDate() { return this.profileForm.get('birthDate'); }
}
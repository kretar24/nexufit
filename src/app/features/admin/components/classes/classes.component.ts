import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassService } from '../../../../core/services/class.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FitnessClass, CreateClassRequest } from '../../../../core/interfaces/class.interface';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent, EmptyStateComponent],
  standalone: true,
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {
  classes: FitnessClass[] = [];
  isLoading = true;
  showCreateForm = false;
  createClassForm: FormGroup;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private notificationService: NotificationService
  ) {
    this.createClassForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(180)]],
      maxCapacity: [15, [Validators.required, Validators.min(1), Validators.max(50)]],
      instructorName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.classes = classes.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudieron cargar las clases');
        this.isLoading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createClassForm.reset({
        duration: 60,
        maxCapacity: 15
      });
    }
  }

  onSubmit(): void {
    if (this.createClassForm.valid && !this.isCreating) {
      this.isCreating = true;
      
      const request: CreateClassRequest = {
        ...this.createClassForm.value,
        date: new Date(this.createClassForm.value.date)
      };

      this.classService.createClass(request).subscribe({
        next: (newClass) => {
          this.notificationService.success('Clase creada', 'La clase ha sido creada correctamente');
          this.loadClasses();
          this.toggleCreateForm();
          this.isCreating = false;
        },
        error: (error) => {
          this.notificationService.error('Error', 'No se pudo crear la clase');
          this.isCreating = false;
        }
      });
    }
  }

  deleteClass(classId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      this.classService.deleteClass(classId).subscribe({
        next: () => {
          this.notificationService.success('Clase eliminada', 'La clase ha sido eliminada correctamente');
          this.loadClasses();
        },
        error: (error) => {
          this.notificationService.error('Error', 'No se pudo eliminar la clase');
        }
      });
    }
  }

  getOccupancyPercentage(fitnessClass: FitnessClass): number {
    return Math.round((fitnessClass.currentCapacity / fitnessClass.maxCapacity) * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  // Form getters
  get name() { return this.createClassForm.get('name'); }
  get description() { return this.createClassForm.get('description'); }
  get date() { return this.createClassForm.get('date'); }
  get startTime() { return this.createClassForm.get('startTime'); }
  get duration() { return this.createClassForm.get('duration'); }
  get maxCapacity() { return this.createClassForm.get('maxCapacity'); }
  get instructorName() { return this.createClassForm.get('instructorName'); }
}
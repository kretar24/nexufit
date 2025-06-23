import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassService } from '../../../../core/services/class.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FitnessClass, CreateClassRequest } from '../../../../core/interfaces/class.interface';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import { SupabaseService } from '../../../../supabase-client';

export interface ClassPeriodicity {
  id: string;
  name: string;
  instructorName: string;
  daysOfWeek: number[]; // [1,2,3] para lun-mar-mie
  startTime: string;
  endTime: string;
  maxCapacity: number;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  companyId: string;
  createdAt: string;
}
//Interfaz para las clases
export interface Class {
  id: string;
  name: string;
  instructorName: string;
  classDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentEnrollments: number;
  description?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  periodicityId?: string; // Si viene de una periodicidad
  companyId: string;
  createdAt: string;
}


@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent, EmptyStateComponent],
  standalone: true,
  styleUrls: ['./classes.component.css']
})

export class ClassesComponent implements OnInit  {
  // Propiedades existentes
  showCreateForm = false;
  isLoading = false;
  isCreating = false;
  classes: Class[] = [];
  createClassForm: FormGroup;

  // Nuevas propiedades para periodicidad
  formMode: 'single' | 'periodicity' = 'single';
  periodicities: ClassPeriodicity[] = [];
  selectedDays: number[] = [];
  
  daysOfWeek = [
    { name: 'Lunes', short: 'L' },
    { name: 'Martes', short: 'M' },
    { name: 'Miércoles', short: 'X' },
    { name: 'Jueves', short: 'J' },
    { name: 'Viernes', short: 'V' },
    { name: 'Sábado', short: 'S' },
    { name: 'Domingo', short: 'D' }
  ];

  constructor(private fb: FormBuilder, private supabase: SupabaseService) {
    this.createClassForm = this.createForm();
  }

  ngOnInit() {
    this.loadClasses();
    this.loadPeriodicities();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      instructorName: ['', [Validators.required, Validators.minLength(2)]],
      date: [''], // Solo para clase individual
      startDate: [''], // Para periodicidad
      endDate: [''], // Para periodicidad
      startTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(180)]],
      maxCapacity: [18, [Validators.required, Validators.min(1), Validators.max(50)]],
      description: ['']
    });
  }

  // Getters para fácil acceso a los controles del formulario
  get name() { return this.createClassForm.get('name'); }
  get instructorName() { return this.createClassForm.get('instructorName'); }
  get date() { return this.createClassForm.get('date'); }
  get startDate() { return this.createClassForm.get('startDate'); }
  get endDate() { return this.createClassForm.get('endDate'); }
  get startTime() { return this.createClassForm.get('startTime'); }
  get duration() { return this.createClassForm.get('duration'); }
  get maxCapacity() { return this.createClassForm.get('maxCapacity'); }

  setFormMode(mode: 'single' | 'periodicity') {
    this.formMode = mode;
    this.selectedDays = [];
    
    // Resetear validadores según el modo
    if (mode === 'single') {
      this.createClassForm.get('date')?.setValidators([Validators.required]);
      this.createClassForm.get('startDate')?.clearValidators();
      this.createClassForm.get('endDate')?.clearValidators();
    } else {
      this.createClassForm.get('date')?.clearValidators();
      this.createClassForm.get('startDate')?.setValidators([Validators.required]);
      this.createClassForm.get('endDate')?.setValidators([Validators.required]);
    }
    
    this.createClassForm.updateValueAndValidity();
  }

  toggleDay(day: number) {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }
    this.selectedDays.sort();
  }

  isFormValid(): boolean {
    if (this.formMode === 'single') {
      return this.createClassForm.valid;
    } else {
      return this.createClassForm.valid && this.selectedDays.length > 0;
    }
  }

  getSelectedDaysText(): string {
    return this.selectedDays
      .map(day => this.daysOfWeek[day - 1].name)
      .join(', ');
  }

  calculateTotalClasses(): number {
    if (!this.startDate?.value || !this.endDate?.value || this.selectedDays.length === 0) {
      return 0;
    }

    const start = new Date(this.startDate.value);
    const end = new Date(this.endDate.value);
    let totalClasses = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // Convertir domingo de 0 a 7
      if (this.selectedDays.includes(dayOfWeek)) {
        totalClasses++;
      }
    }
    
    return totalClasses;
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isCreating = true;

    try {
      if (this.formMode === 'single') {
        await this.createSingleClass();
      } else {
        await this.createPeriodicity();
      }
      
      this.toggleCreateForm();
      this.loadClasses();
      this.loadPeriodicities();
    } catch (error) {
      console.error('Error creating class/periodicity:', error);
      // Aquí puedes agregar notificación de error
    } finally {
      this.isCreating = false;
    }
  }

  private async createSingleClass() {
    const formValue = this.createClassForm.value;
    const endTime = this.calculateEndTime(formValue.startTime, formValue.duration);
    
    const classData = {
      name: formValue.name,
      instructor_name: formValue.instructorName,
      class_date: formValue.date,
      start_time: formValue.startTime,
      end_time: endTime,
      max_capacity: formValue.maxCapacity,
      current_enrollments: 0,
      description: formValue.description,
      status: 'scheduled',
      company_id: this.getCurrentCompanyId(),
      periodicity_id: null
    };

    const { error } = await this.supabase.client
      .from('classes')
      .insert([classData]);

    if (error) throw error;
  }

  private async createPeriodicity() {
    const formValue = this.createClassForm.value;
    const endTime = this.calculateEndTime(formValue.startTime, formValue.duration);
    
    // 1. Crear la periodicidad
    const periodicityData = {
      name: formValue.name,
      instructor_name: formValue.instructorName,
      days_of_week: this.selectedDays,
      start_time: formValue.startTime,
      end_time: endTime,
      max_capacity: formValue.maxCapacity,
      description: formValue.description,
      start_date: formValue.startDate,
      end_date: formValue.endDate,
      status: 'active',
      company_id: this.getCurrentCompanyId()
    };

    const { data: periodicity, error: periodicityError } = await this.supabase.client
      .from('class_periodicities')
      .insert([periodicityData])
      .select()
      .single();

    if (periodicityError) throw periodicityError;

    // 2. Generar las clases individuales
    await this.generateClassesFromPeriodicity(periodicity);
  }

  private async generateClassesFromPeriodicity(periodicity: any) {
    const start = new Date(periodicity.start_date);
    const end = new Date(periodicity.end_date);
    const classes = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      
      if (periodicity.days_of_week.includes(dayOfWeek)) {
        classes.push({
          name: periodicity.name,
          instructor_name: periodicity.instructor_name,
          class_date: d.toISOString().split('T')[0],
          start_time: periodicity.start_time,
          end_time: periodicity.end_time,
          max_capacity: periodicity.max_capacity,
          current_enrollments: 0,
          description: periodicity.description,
          status: 'scheduled',
          company_id: periodicity.company_id,
          periodicity_id: periodicity.id
        });
      }
    }

    if (classes.length > 0) {
      const { error } = await this.supabase.client
        .from('classes')
        .insert(classes);

      if (error) throw error;
    }
  }

  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    
    return endDate.toTimeString().slice(0, 5);
  }

  async loadClasses() {
    this.isLoading = true;
    
    try {
      const { data, error } = await this.supabase.client
        .from('classes')
        .select('*')
        .eq('company_id', this.getCurrentCompanyId())
        .gte('class_date', new Date().toISOString().split('T')[0])
        .order('class_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      this.classes = data || [];
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadPeriodicities() {
    try {
      const { data, error } = await this.supabase.client
        .from('class_periodicities')
        .select('*')
        .eq('company_id', this.getCurrentCompanyId())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      this.periodicities = data || [];
    } catch (error) {
      console.error('Error loading periodicities:', error);
    }
  }

  async deleteClass(classId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      return;
    }

    try {
      const { error } = await this.supabase.client
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      
      this.loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  }

  async cancelClass(classId: string) {
    const reason = prompt('Razón de la cancelación (opcional):');
    
    try {
      const { error } = await this.supabase.client
        .from('classes')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason || null
        })
        .eq('id', classId);

      if (error) throw error;
      
      this.loadClasses();
    } catch (error) {
      console.error('Error cancelling class:', error);
    }
  }

  async deletePeriodicity(periodicityId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta periodicidad? Esto también eliminará todas las clases futuras asociadas.')) {
      return;
    }

    try {
      // Eliminar clases futuras asociadas
      await this.supabase.client
        .from('classes')
        .delete()
        .eq('periodicity_id', periodicityId)
        .gte('class_date', new Date().toISOString().split('T')[0]);

      // Eliminar la periodicidad
      const { error } = await this.supabase.client
        .from('class_periodicities')
        .delete()
        .eq('id', periodicityId);

      if (error) throw error;
      
      this.loadClasses();
      this.loadPeriodicities();
    } catch (error) {
      console.error('Error deleting periodicity:', error);
    }
  }

  async togglePeriodicityStatus(periodicityId: string) {
    try {
      const periodicity = this.periodicities.find(p => p.id === periodicityId);
      if (!periodicity) return;

      const newStatus = periodicity.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await this.supabase.client
        .from('class_periodicities')
        .update({ status: newStatus })
        .eq('id', periodicityId);

      if (error) throw error;
      
      this.loadPeriodicities();
    } catch (error) {
      console.error('Error updating periodicity status:', error);
    }
  }

  // Métodos de utilidad para el template
  getOccupancyPercentage(classItem: Class): number {
    return Math.round((classItem.currentEnrollments / classItem.maxCapacity) * 100);
  }

  getOccupancyColor(percentage: number): string {
    if (percentage < 70) return 'text-green-600';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Programada',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
  }

  formatDaysOfWeek(days: number[]): string {
    return days
      .sort()
      .map(day => this.daysOfWeek[day - 1].short)
      .join('-');
  }

  calculateDuration(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createClassForm.reset();
      this.formMode = 'single';
      this.selectedDays = [];
      // Establecer valores por defecto
      this.createClassForm.patchValue({
        maxCapacity: 18,
        duration: 60
      });
    }
  }

  private getCurrentCompanyId(): string {
    // Implementar según tu lógica de autenticación
    // Por ejemplo, desde un servicio de autenticación
    return 'company-id-from-auth-service';
  }
}
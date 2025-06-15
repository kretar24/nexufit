import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FitnessClass, CreateClassRequest, UpdateClassRequest, ClassBooking } from '../interfaces/class.interface';
import { addDays, startOfWeek, format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private classesSubject = new BehaviorSubject<FitnessClass[]>([]);
  public classes$ = this.classesSubject.asObservable();

  private bookingsSubject = new BehaviorSubject<ClassBooking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  // Mock data
  private mockClasses: FitnessClass[] = [
    {
      id: '1',
      name: 'CrossFit Matutino',
      description: 'Sesión de CrossFit para comenzar el día con energía',
      date: new Date(),
      startTime: '08:00',
      duration: 60,
      maxCapacity: 15,
      currentCapacity: 12,
      instructorName: 'Ana Martínez',
      enrolledUsers: ['2', '3'],
      isActive: true
    },
    {
      id: '2',
      name: 'Yoga Relajante',
      description: 'Clase de yoga para relajación y flexibilidad',
      date: new Date(),
      startTime: '18:00',
      duration: 75,
      maxCapacity: 20,
      currentCapacity: 8,
      instructorName: 'Carlos Ruiz',
      enrolledUsers: ['2'],
      isActive: true
    },
    {
      id: '3',
      name: 'HIIT Avanzado',
      description: 'Entrenamiento de alta intensidad para nivel avanzado',
      date: addDays(new Date(), 1),
      startTime: '19:00',
      duration: 45,
      maxCapacity: 12,
      currentCapacity: 10,
      instructorName: 'Miguel Torres',
      enrolledUsers: ['3'],
      isActive: true
    }
  ];

  private mockBookings: ClassBooking[] = [
    {
      id: '1',
      classId: '1',
      userId: '2',
      bookingDate: new Date(),
      status: 'confirmed'
    },
    {
      id: '2',
      classId: '2',
      userId: '2',
      bookingDate: new Date(),
      status: 'confirmed'
    }
  ];

  constructor() {
    this.classesSubject.next(this.mockClasses);
    this.bookingsSubject.next(this.mockBookings);
  }

  getClasses(): Observable<FitnessClass[]> {
    return of(this.mockClasses);
  }

  getClassById(id: string): Observable<FitnessClass | undefined> {
    const fitnessClass = this.mockClasses.find(c => c.id === id);
    return of(fitnessClass);
  }

  createClass(request: CreateClassRequest): Observable<FitnessClass> {
    const newClass: FitnessClass = {
      id: (this.mockClasses.length + 1).toString(),
      name: request.name,
      description: request.description,
      date: request.date,
      startTime: request.startTime,
      duration: request.duration,
      maxCapacity: request.maxCapacity,
      currentCapacity: 0,
      instructorName: request.instructorName,
      enrolledUsers: [],
      isActive: true
    };

    this.mockClasses.push(newClass);
    this.classesSubject.next(this.mockClasses);
    return of(newClass);
  }

  updateClass(id: string, request: UpdateClassRequest): Observable<FitnessClass> {
    const classIndex = this.mockClasses.findIndex(c => c.id === id);
    if (classIndex === -1) {
      throw new Error('Clase no encontrada');
    }

    this.mockClasses[classIndex] = {
      ...this.mockClasses[classIndex],
      ...request
    };

    this.classesSubject.next(this.mockClasses);
    return of(this.mockClasses[classIndex]);
  }

  deleteClass(id: string): Observable<void> {
    const classIndex = this.mockClasses.findIndex(c => c.id === id);
    if (classIndex !== -1) {
      this.mockClasses.splice(classIndex, 1);
      this.classesSubject.next(this.mockClasses);
    }
    return of();
  }

  bookClass(classId: string, userId: string): Observable<ClassBooking> {
    const fitnessClass = this.mockClasses.find(c => c.id === classId);
    if (!fitnessClass) {
      throw new Error('Clase no encontrada');
    }

    if (fitnessClass.currentCapacity >= fitnessClass.maxCapacity) {
      throw new Error('Clase llena');
    }

    if (fitnessClass.enrolledUsers.includes(userId)) {
      throw new Error('Ya estás inscrito en esta clase');
    }

    // Create booking
    const booking: ClassBooking = {
      id: (this.mockBookings.length + 1).toString(),
      classId,
      userId,
      bookingDate: new Date(),
      status: 'confirmed'
    };

    // Update class
    fitnessClass.enrolledUsers.push(userId);
    fitnessClass.currentCapacity++;

    this.mockBookings.push(booking);
    this.bookingsSubject.next(this.mockBookings);
    this.classesSubject.next(this.mockClasses);

    return of(booking);
  }

  cancelBooking(classId: string, userId: string): Observable<void> {
    const bookingIndex = this.mockBookings.findIndex(
      b => b.classId === classId && b.userId === userId && b.status === 'confirmed'
    );

    if (bookingIndex !== -1) {
      this.mockBookings[bookingIndex].status = 'cancelled';
      
      // Update class
      const fitnessClass = this.mockClasses.find(c => c.id === classId);
      if (fitnessClass) {
        const userIndex = fitnessClass.enrolledUsers.indexOf(userId);
        if (userIndex !== -1) {
          fitnessClass.enrolledUsers.splice(userIndex, 1);
          fitnessClass.currentCapacity--;
        }
      }

      this.bookingsSubject.next(this.mockBookings);
      this.classesSubject.next(this.mockClasses);
    }

    return of();
  }

  getUserBookings(userId: string): Observable<ClassBooking[]> {
    const userBookings = this.mockBookings.filter(
      b => b.userId === userId && b.status === 'confirmed'
    );
    return of(userBookings);
  }

  getWeeklyClasses(): Observable<FitnessClass[]> {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);

    const weeklyClasses = this.mockClasses.filter(c => {
      const classDate = new Date(c.date);
      return classDate >= startOfCurrentWeek && classDate <= endOfCurrentWeek;
    });

    return of(weeklyClasses);
  }

  getTodayClasses(): Observable<FitnessClass[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayClasses = this.mockClasses.filter(c => 
      format(new Date(c.date), 'yyyy-MM-dd') === today
    );
    return of(todayClasses);
  }
}
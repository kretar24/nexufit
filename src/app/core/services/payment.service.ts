import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Payment, CreatePaymentRequest, PaymentStats } from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  public payments$ = this.paymentsSubject.asObservable();

  // Mock data
  private mockPayments: Payment[] = [
    {
      id: '1',
      userId: '2',
      amount: 50,
      paymentDate: new Date('2024-01-01'),
      method: 'transfer',
      status: 'verified',
      receiptUrl: 'https://example.com/receipt1.jpg',
      verifiedBy: '1',
      verificationDate: new Date('2024-01-02')
    },
    {
      id: '2',
      userId: '3',
      amount: 50,
      paymentDate: new Date('2024-01-15'),
      method: 'transfer',
      status: 'pending',
      receiptUrl: 'https://example.com/receipt2.jpg'
    },
    {
      id: '3',
      userId: '4',
      amount: 50,
      paymentDate: new Date('2024-01-10'),
      method: 'cash',
      status: 'verified',
      verifiedBy: '1',
      verificationDate: new Date('2024-01-10')
    }
  ];

  constructor() {
    this.paymentsSubject.next(this.mockPayments);
  }

  getPayments(): Observable<Payment[]> {
    return of(this.mockPayments);
  }

  getUserPayments(userId: string): Observable<Payment[]> {
    const userPayments = this.mockPayments.filter(p => p.userId === userId);
    return of(userPayments);
  }

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    const newPayment: Payment = {
      id: (this.mockPayments.length + 1).toString(),
      userId: request.userId,
      amount: request.amount,
      paymentDate: new Date(),
      method: request.method,
      status: 'pending',
      receiptUrl: request.receiptUrl,
      notes: request.notes
    };

    this.mockPayments.push(newPayment);
    this.paymentsSubject.next(this.mockPayments);
    return of(newPayment);
  }

  verifyPayment(id: string, verifiedBy: string): Observable<Payment> {
    const paymentIndex = this.mockPayments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      throw new Error('Pago no encontrado');
    }

    this.mockPayments[paymentIndex] = {
      ...this.mockPayments[paymentIndex],
      status: 'verified',
      verifiedBy,
      verificationDate: new Date()
    };

    this.paymentsSubject.next(this.mockPayments);
    return of(this.mockPayments[paymentIndex]);
  }

  rejectPayment(id: string, notes?: string): Observable<Payment> {
    const paymentIndex = this.mockPayments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      throw new Error('Pago no encontrado');
    }

    this.mockPayments[paymentIndex] = {
      ...this.mockPayments[paymentIndex],
      status: 'rejected',
      notes: notes || this.mockPayments[paymentIndex].notes
    };

    this.paymentsSubject.next(this.mockPayments);
    return of(this.mockPayments[paymentIndex]);
  }

  getPaymentStats(): Observable<PaymentStats> {
    const totalPaid = this.mockPayments
      .filter(p => p.status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = this.mockPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalOverdue = this.mockPayments
      .filter(p => p.status === 'rejected')
      .reduce((sum, p) => sum + p.amount, 0);

    // Mock monthly revenue calculation
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = this.mockPayments
      .filter(p => p.status === 'verified' && new Date(p.paymentDate).getMonth() === currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const stats: PaymentStats = {
      totalPaid,
      totalPending,
      totalOverdue,
      monthlyRevenue
    };

    return of(stats);
  }

  getPendingPayments(): Observable<Payment[]> {
    const pendingPayments = this.mockPayments.filter(p => p.status === 'pending');
    return of(pendingPayments);
  }
}
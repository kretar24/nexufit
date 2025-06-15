export interface Payment {
  id: string;
  userId: string;
  amount: number;
  paymentDate: Date;
  method: 'transfer' | 'cash' | 'card';
  status: 'pending' | 'verified' | 'rejected';
  receiptUrl?: string;
  notes?: string;
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  method: 'transfer' | 'cash' | 'card';
  receiptUrl?: string;
  notes?: string;
}

export interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  monthlyRevenue: number;
}
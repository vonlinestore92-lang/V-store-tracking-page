export enum OrderStatus {
  PLACED = 'Placed',
  CONFIRMED = 'Confirmed',
  PACKED = 'Packed',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  // Return Statuses
  RETURN_REQUESTED = 'Return Requested',
  RETURN_APPROVED = 'Return Approved',
  RETURN_REJECTED = 'Return Rejected',
  PICKUP_SCHEDULED = 'Pickup Scheduled',
  RETURNED = 'Returned',
  REFUND_INITIATED = 'Refund Initiated',
  REFUND_COMPLETED = 'Refund Completed',
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  PREPAID = 'Prepaid',
  PARTIAL = 'Partial Payment',
}

export enum ReturnType {
  REPLACEMENT = 'Replacement',
  REFUND = 'Refund',
}

export enum RefundMethod {
  ORIGINAL = 'Original Payment Source',
  MANUAL_UPI = 'Manual UPI Transfer',
  MANUAL_BANK = 'Manual Bank Transfer',
  CASH = 'Cash',
}

export interface ProductItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  fullName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
}

export interface OrderHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface ReturnDetails {
  reason: string;
  type: ReturnType;
  remarks?: string;
  pickupDate?: string;
  pickupTime?: string;
  trackingUrl?: string;
  refundStatus?: 'Pending' | 'Completed';
  refundMethod?: RefundMethod;
}

export interface Order {
  id: string;
  customer: Customer;
  products: ProductItem[];
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentMethod: PaymentMethod;
  currentStatus: OrderStatus;
  history: OrderHistoryItem[];
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  expectedDeliveryDate?: string;
  expectedDeliveryTime?: string;
  courierTrackingUrl?: string;
  // Return Logic
  returnDetails?: ReturnDetails;
}

export interface StaffPermissions {
  canAddOrders: boolean;
  canEditDetails: boolean;
  canAddAdvance: boolean;
  canChangeStatus: boolean;
  // New Return Permissions
  canManageReturns: boolean;
  canProcessRefunds: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'STAFF';
  permissions?: StaffPermissions;
  isActive: boolean;
}

export interface OrderFormData {
  customerName: string;
  customerMobile: string;
  products: ProductItem[];
  paymentMethod: PaymentMethod;
  initialStatus: OrderStatus;
  adminNotes: string;
  expectedDeliveryDate: string;
  expectedDeliveryTime: string;
  courierTrackingUrl: string;
  advanceAmount: number;
}
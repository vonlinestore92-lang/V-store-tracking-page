import { OrderStatus } from './types';

export const APP_NAME = 'V STORE';

export const STATUS_SEQUENCE = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PACKED,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export const RETURN_STATUS_SEQUENCE = [
  OrderStatus.RETURN_REQUESTED,
  OrderStatus.RETURN_APPROVED,
  OrderStatus.PICKUP_SCHEDULED,
  OrderStatus.RETURNED,
  OrderStatus.REFUND_COMPLETED,
];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.CONFIRMED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.PACKED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  // Returns
  [OrderStatus.RETURN_REQUESTED]: 'bg-pink-100 text-pink-800',
  [OrderStatus.RETURN_APPROVED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.RETURN_REJECTED]: 'bg-gray-100 text-gray-800',
  [OrderStatus.PICKUP_SCHEDULED]: 'bg-orange-100 text-orange-800',
  [OrderStatus.RETURNED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.REFUND_INITIATED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.REFUND_COMPLETED]: 'bg-green-100 text-green-800',
};

export const INITIAL_ADMIN_EMAIL = 'vonlinestore92@gmail.com';
export const INITIAL_ADMIN_PASSWORD = 'Vstoreonline@123';

export const RETURN_REASONS = [
  "Damaged Product",
  "Wrong Item Received",
  "Size Issue",
  "Quality Not as Expected",
  "Others"
];
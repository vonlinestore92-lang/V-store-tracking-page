import { Order, OrderStatus, PaymentMethod, User, ReturnType } from '../types';
import { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } from '../constants';

const STORAGE_KEY_ORDERS = 'vstore_orders';
const STORAGE_KEY_SESSION = 'vstore_session';
const STORAGE_KEY_STAFF = 'vstore_staff';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ADMIN_USER: User = {
  id: 'ADMIN_001',
  name: 'Super Admin',
  email: INITIAL_ADMIN_EMAIL,
  role: 'ADMIN',
  isActive: true
};

const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    
    const mockOrders: Order[] = [
      {
        id: 'ORD-1001',
        customer: { fullName: 'Rahul Sharma', mobileNumber: '9876543210', address: '123 MG Road, Bangalore' },
        products: [{ name: 'Wireless Headphones', quantity: 1, price: 2499 }],
        totalAmount: 2499,
        advanceAmount: 2499,
        balanceAmount: 0,
        paymentMethod: PaymentMethod.PREPAID,
        currentStatus: OrderStatus.DELIVERED,
        createdAt: yesterday,
        updatedAt: now,
        history: [
            { status: OrderStatus.PLACED, timestamp: yesterday }, 
            { status: OrderStatus.SHIPPED, timestamp: yesterday },
            { status: OrderStatus.DELIVERED, timestamp: now }
        ],
        adminNotes: 'Delivered successfully.',
      },
      {
        id: 'ORD-1002',
        customer: { fullName: 'Priya Singh', mobileNumber: '9123456789', address: '45 Park Street, Kolkata' },
        products: [{ name: 'Smart Watch', quantity: 1, price: 5000 }],
        totalAmount: 5000,
        advanceAmount: 1000,
        balanceAmount: 4000,
        paymentMethod: PaymentMethod.PARTIAL,
        currentStatus: OrderStatus.RETURN_REQUESTED,
        createdAt: yesterday,
        updatedAt: now,
        history: [
            { status: OrderStatus.PLACED, timestamp: yesterday }, 
            { status: OrderStatus.DELIVERED, timestamp: yesterday },
            { status: OrderStatus.RETURN_REQUESTED, timestamp: now }
        ],
        returnDetails: {
            reason: 'Damaged Product',
            type: ReturnType.REPLACEMENT,
            remarks: 'Screen is cracked on arrival.'
        }
      }
    ];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(mockOrders));
  }

  if (!localStorage.getItem(STORAGE_KEY_STAFF)) {
    const mockStaff: User[] = [
      {
        id: 'STAFF_001',
        name: 'Sales Staff 1',
        email: 'staff@vstore.in',
        password: 'password123',
        role: 'STAFF',
        isActive: true,
        permissions: {
          canAddOrders: true,
          canEditDetails: true,
          canAddAdvance: true,
          canChangeStatus: false,
          canManageReturns: false,
          canProcessRefunds: false
        }
      }
    ];
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(mockStaff));
  }
};

seedData();

export const StorageService = {
  getOrders: async (): Promise<Order[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY_ORDERS);
    return data ? JSON.parse(data) : [];
  },

  getOrderById: async (id: string): Promise<Order | undefined> => {
    await delay(200);
    const orders = await StorageService.getOrders();
    return orders.find((o) => o.id === id);
  },

  searchOrders: async (query: string): Promise<Order[]> => {
    await delay(400);
    const orders = await StorageService.getOrders();
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return orders.filter(order => 
      order.id.toLowerCase().includes(q) ||
      order.customer.mobileNumber.includes(q) ||
      order.customer.fullName.toLowerCase().includes(q)
    );
  },

  createOrder: async (order: Order): Promise<void> => {
    await delay(400);
    const orders = await StorageService.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  },

  updateOrder: async (updatedOrder: Order): Promise<void> => {
    await delay(300);
    const orders = await StorageService.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
      await delay(300);
      let orders = await StorageService.getOrders();
      orders = orders.filter(o => o.id !== id);
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  },

  authenticate: async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    if (email === INITIAL_ADMIN_EMAIL && password === INITIAL_ADMIN_PASSWORD) {
        return ADMIN_USER;
    }
    const staffList = await StorageService.getStaff();
    const foundStaff = staffList.find(s => s.email === email && s.isActive);
    
    // Check against stored password, fallback to 'password123' if not set in older data
    if (foundStaff) {
        const storedPwd = foundStaff.password || 'password123';
        if (storedPwd === password) {
            return foundStaff;
        }
    }
    return null;
  },

  setSession: (user: User) => {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  },

  getSession: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY_SESSION);
    return data ? JSON.parse(data) : null;
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getStaff: async (): Promise<User[]> => {
    const data = localStorage.getItem(STORAGE_KEY_STAFF);
    return data ? JSON.parse(data) : [];
  },

  saveStaff: async (staffMember: User): Promise<void> => {
    const list = await StorageService.getStaff();
    const index = list.findIndex(s => s.id === staffMember.id);
    if (index >= 0) {
        // Preserve existing password if not provided in update (logic handled in UI usually, but good to be safe)
        // If the UI sends the password, use it.
        list[index] = staffMember;
    } else {
        list.push(staffMember);
    }
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(list));
  },

  deleteStaff: async (id: string): Promise<void> => {
    let list = await StorageService.getStaff();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(list));
  }
};
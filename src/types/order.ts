export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  ROOM_SERVICE = 'ROOM_SERVICE',
}

export enum OrderStatus {
  PLACED = 'PLACED',
  IN_KITCHEN = 'IN_KITCHEN',
  SERVED = 'SERVED',
  BILLED = 'BILLED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  department: 'KITCHEN' | 'BAR';
}

export interface OrderItem {
  id?: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
  modifiers?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  roomNumber?: string;
  orderType: OrderType;
  status: OrderStatus;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  tableNumber?: string;
  roomNumber?: string;
  orderType: OrderType;
  userId: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    modifiers?: string;
  }[];
  notes?: string;
}

export interface UpdateOrderDto {
  tableNumber?: string;
  roomNumber?: string;
  orderType?: OrderType;
  status?: OrderStatus;
  items?: OrderItem[];
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: boolean;
} 
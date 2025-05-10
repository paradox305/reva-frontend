import axios from 'axios';
import { MenuItem, TableOrder } from '../types/table';

const API_URL = 'http://localhost:3001/orders';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'ROOM_SERVICE';
export type OrderStatus = 'PLACED' | 'IN_KITCHEN' | 'SERVED' | 'BILLED' | 'COMPLETED' | 'CANCELLED';

export interface CreateOrderDto {
  tableNumber: string;
  orderType: OrderType;
  items: OrderItemDto[];
  notes?: string;
}

export interface OrderItemDto {
  menuItemId: string;
  quantity: number;
  notes?: string;
  modifiers?: string;
}

export interface OrderItem extends OrderItemDto {
  id: string;
  orderId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  roomNumber?: string;
  orderType: OrderType;
  status: OrderStatus;
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

export const orderService = {
  async createOrder(data: CreateOrderDto): Promise<Order> {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getTableOrders(tableNumber: string): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_URL}/table/${tableNumber}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching table orders:', error);
      throw error;
    }
  },

  async getCurrentOrder(tableNumber: string): Promise<Order | null> {
    try {
      const response = await axios.get(`${API_URL}/table/${tableNumber}/current`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching current order:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await axios.patch(`${API_URL}/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async addItemToOrder(orderId: string, item: OrderItemDto): Promise<Order> {
    try {
      const response = await axios.post(`${API_URL}/${orderId}/items`, item);
      return response.data;
    } catch (error: any) {
      console.error('Error adding item to order:', error);
      throw error;
    }
  },

  async removeItemFromOrder(orderId: string, menuItemId: string): Promise<Order> {
    try {
      const response = await axios.delete(`${API_URL}/${orderId}/items/${menuItemId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing item from order:', error);
      throw error;
    }
  },

  async updateItemQuantity(orderId: string, menuItemId: string, quantity: number): Promise<Order> {
    try {
      const response = await axios.patch(`${API_URL}/${orderId}/items/${menuItemId}`, { quantity });
      return response.data;
    } catch (error: any) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  },

  async syncTableStatuses(): Promise<void> {
    try {
      await axios.post(`${API_URL}/sync-table-statuses`);
    } catch (error: any) {
      console.error('Error syncing table statuses:', error);
      throw error;
    }
  }
}; 
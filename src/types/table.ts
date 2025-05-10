export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface TableOrder {
  id: string;
  startTime: string;
  amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  isOccupied: boolean;
  currentOrder?: TableOrder;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface CreateTableDto {
  number: number;
  capacity: number;
} 
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  inStock: boolean;
  isAvailable: boolean;
  department: 'BAR' | 'KITCHEN';
  inventoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  department: 'BAR' | 'KITCHEN';
  inventoryCount?: number;
} 
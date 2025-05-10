import axios from 'axios';
import { MenuItem, CreateMenuItemDto } from '../types/menu';

const API_URL = 'http://localhost:3001/menu';

export interface GetMenuItemsParams {
  category?: string;
  search?: string;
  searchTerm?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async searchMenuItems(params: GetMenuItemsParams): Promise<MenuItem[]> {
    return this.getMenuItems(params);
  },

  async getMenuItems(params?: GetMenuItemsParams): Promise<MenuItem[]> {
    try {
      const response = await axios.get(`${API_URL}/items`, { params });
      // Filter out any items that might have invalid data
      return response.data.filter((item: any) => item && item.id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return []; // Return empty array if no items found
      }
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    try {
      const response = await axios.get(`${API_URL}/items/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  async createMenuItem(data: CreateMenuItemDto): Promise<MenuItem> {
    try {
      const response = await axios.post(`${API_URL}/items`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  async updateMenuItem(id: string, data: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    try {
      const response = await axios.put(`${API_URL}/items/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  async deleteMenuItem(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Menu item with ID ${id} not found`);
      }
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  async updateMenuItemStock(id: string, inStock: boolean): Promise<MenuItem> {
    try {
      const response = await axios.patch(`${API_URL}/items/${id}/stock`, { inStock });
      return response.data;
    } catch (error: any) {
      console.error('Error updating menu item stock:', error);
      throw error;
    }
  }
}; 
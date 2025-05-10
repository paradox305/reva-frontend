import axios from 'axios';

const API_URL = `${process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'}/analytics`;

export interface DailySales {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  topSellingItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  salesByHour: {
    hour: number;
    sales: number;
    orderCount: number;
  }[];
}

export const analyticsService = {
  async getDailySales(date?: string): Promise<DailySales> {
    try {
      const response = await axios.get(`${API_URL}/daily-sales`, {
        params: { date }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching daily sales:', error);
      throw error;
    }
  }
}; 
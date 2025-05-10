import axios from 'axios';
import { Table, CreateTableDto } from '../types/table';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.TABLES;

export const tableService = {
  async createTable(data: CreateTableDto): Promise<Table> {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  async getTables(): Promise<Table[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async getTableById(id: number): Promise<Table> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async getTableByNumber(number: number): Promise<Table> {
    const response = await axios.get(`${API_URL}/number/${number}`);
    return response.data;
  }
}; 
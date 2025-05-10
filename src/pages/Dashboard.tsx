import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../types/table';
import { tableService } from '../services/tableService';
import { analyticsService, DailySales } from '../services/analyticsService';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<DailySales | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesData, salesData] = await Promise.all([
        tableService.getTables(),
        analyticsService.getDailySales(selectedDate)
      ]);
      console.log('Loaded sales data:', salesData);
      setTables(tablesData);
      setSalesData(salesData);
      setError(null);
    } catch (err: any) {
      console.error('Error details:', err);
      if (err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Cannot connect to the analytics service. Please ensure the backend server is running.');
      } else {
        setError('Failed to load dashboard data');
      }
      setSalesData(null);
    } finally {
      setLoading(false);
    }
  };

  const getTableStatistics = () => {
    const total = tables.length;
    const occupied = tables.filter(table => table.isOccupied).length;
    const available = total - occupied;
    return { total, occupied, available };
  };

  if (loading) return (
    <div className="flex justify-center items-center p-4">
      <div className="text-lg text-gray-600">Loading dashboard data...</div>
    </div>
  );
  
  if (!salesData) return (
    <div className="flex justify-center items-center p-4">
      <div className="text-lg text-red-600">No sales data available</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center p-4">
      <div className="text-lg text-red-600">{error}</div>
    </div>
  );

  const stats = getTableStatistics();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the Hotel Bar Management System</p>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Sales Analytics */}
      {salesData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
              <p className="text-3xl font-bold text-green-600">
                ₹{salesData.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Orders</h3>
              <p className="text-3xl font-bold text-blue-600">{salesData.orderCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">Average Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                ₹{salesData.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.topSellingItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly Sales Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Hour</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-[400px]">
                <Line
                  data={{
                    labels: salesData.salesByHour.map(hour => `${hour.hour}:00`),
                    datasets: [
                      {
                        label: 'Number of Orders',
                        data: salesData.salesByHour.map(hour => hour.orderCount),
                        borderColor: 'rgb(79, 70, 229)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: 'rgb(79, 70, 229)',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const hour = salesData.salesByHour[context.dataIndex];
                            return `Orders: ${hour.orderCount} (Sales: ₹${hour.sales.toFixed(2)})`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Tables</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Available Tables</h3>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Occupied Tables</h3>
          <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/tables"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-indigo-600">Manage Tables</h3>
            <p className="text-gray-600 mt-2">View and manage all tables</p>
          </Link>
          <Link
            to="/menu"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-indigo-600">Menu Management</h3>
            <p className="text-gray-600 mt-2">Manage menu items and categories</p>
          </Link>
          <Link
            to="/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-indigo-600">Orders</h3>
            <p className="text-gray-600 mt-2">View and manage orders</p>
          </Link>
        </div>
      </div>

      {/* Recent Tables Status */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tables Status</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.slice(0, 5).map((table) => (
                  <tr key={table.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{table.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.capacity} persons
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          table.isOccupied
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {table.isOccupied ? 'Occupied' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
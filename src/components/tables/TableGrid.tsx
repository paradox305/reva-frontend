import React from 'react';
import { Table, TableStatus, TableOrder } from '../../types/table';

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const getStatusColor = (status: TableStatus): string => {
  switch (status) {
    case 'occupied':
      return 'bg-red-100 border-red-500 shadow-lg';
    case 'available':
      return 'bg-green-100 border-green-500';
    case 'reserved':
      return 'bg-yellow-50 border-yellow-300';
    case 'cleaning':
      return 'bg-blue-50 border-blue-300';
    default:
      return 'bg-gray-50 border-gray-300';
  }
};

const formatDuration = (startTime: string): string => {
  const start = new Date(startTime);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <div
          key={table.id}
          onClick={() => onTableClick(table)}
          className={`${getStatusColor(
            table.isOccupied ? 'occupied' : 'available' as TableStatus
          )} cursor-pointer rounded-lg border-2 hover:shadow-xl transition-all relative overflow-hidden`}
        >
          {table.isOccupied && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-bl">
              Active
            </div>
          )}
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  table.isOccupied ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <h3 className="text-lg font-bold">Table {table.number}</h3>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                table.isOccupied 
                  ? 'bg-red-200 text-red-800' 
                  : 'bg-green-200 text-green-800'
              }`}>
                {table.isOccupied ? 'Occupied' : 'Available'}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm">Capacity: {table.capacity}</span>
            </div>

            {table.currentOrder && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Order #{table.currentOrder.id}</span>
                  <span className="font-medium text-gray-800">{formatDuration(table.currentOrder.startTime)}</span>
                </div>

                {/* Order Items Preview */}
                <div className="mb-3 max-h-24 overflow-y-auto">
                  {table.currentOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm py-1 text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="ml-2">{item.name}</span>
                      </div>
                      <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200 pt-2">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Items: {table.currentOrder.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center text-gray-600 justify-end font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>₹{table.currentOrder.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableGrid; 
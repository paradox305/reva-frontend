import React, { useEffect, useState } from 'react';
import { Table } from '../../types/table';
import { tableService } from '../../services/tableService';

const TableList: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await tableService.getTables();
      setTables(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`p-4 rounded-lg shadow ${
            table.isOccupied ? 'bg-red-100' : 'bg-green-100'
          }`}
        >
          <h3 className="text-lg font-semibold">Table #{table.number}</h3>
          <p>Capacity: {table.capacity}</p>
          <p>Status: {table.isOccupied ? 'Occupied' : 'Available'}</p>
        </div>
      ))}
    </div>
  );
};

export default TableList; 
import React, { useState, useEffect } from 'react';
import TableGrid from '../components/tables/TableGrid';
import AddTable from '../components/tables/AddTable';
import TableOrderModal from '../components/tables/TableOrderModal';
import { Table } from '../types/table';
import { tableService } from '../services/tableService';
import { orderService } from '../services/orderService';

const Tables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);

  const loadTables = async () => {
    try {
      setLoading(true);
      // Sync table statuses before loading tables
      await orderService.syncTableStatuses();
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

  useEffect(() => {
    loadTables();
  }, []);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedTable(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tables</h1>
        <button
          onClick={() => setIsAddTableModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-200 hover:scale-105"
        >
          +
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <TableGrid tables={tables} onTableClick={handleTableClick} />
      </div>

      {selectedTable && (
        <TableOrderModal
          table={selectedTable}
          isOpen={isOrderModalOpen}
          onClose={handleCloseOrderModal}
          onOrderUpdate={loadTables}
        />
      )}

      <AddTable 
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        onTableAdded={() => {
          loadTables();
          setIsAddTableModalOpen(false);
        }}
      />
    </div>
  );
};

export default Tables; 
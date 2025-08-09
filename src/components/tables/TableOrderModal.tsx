import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from '../common/Table';
import { Table as TableType, MenuItem } from '../../types/table';
import { orderService, Order, OrderItem } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import type { GetMenuItemsParams, MenuCategory } from '../../services/menuService';
import debounce from 'lodash/debounce';
import BillPrint from './BillPrint';

interface TableOrderModalProps {
  table: TableType;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: () => void;
}

const TableOrderModal: React.FC<TableOrderModalProps> = ({ table, isOpen, onClose, onOrderUpdate }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'current-order'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetMenuItemsParams>({});
  const [newItemQuantities, setNewItemQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data (categories and current order)
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, currentOrderData] = await Promise.all([
        menuService.getCategories(),
        orderService.getCurrentOrder(table.number.toString())
      ]);

      setCategories(categoriesData);
      setCurrentOrder(currentOrderData);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (params: GetMenuItemsParams) => {
      try {
        setSearchLoading(true);
        const items = await menuService.searchMenuItems(params);
        setMenuItems(items);
        setError(null);
      } catch (err) {
        setError('Failed to search menu items');
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  // Effect for search term and category changes
  useEffect(() => {
    const searchQuery: GetMenuItemsParams = {
      ...(selectedCategory && { category: selectedCategory }),
      ...(searchTerm && { searchTerm }),
    };
    debouncedSearch(searchQuery);

    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, selectedCategory, debouncedSearch]);

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    setNewItemQuantities(prev => ({
      ...prev,
      [menuItemId]: Math.max(0, quantity)
    }));
  };

  const getItemQuantity = (menuItemId: string): number => {
    return typeof newItemQuantities[menuItemId] === 'number' ? newItemQuantities[menuItemId] : 1;
  };

  const handleAddItem = async (menuItem: MenuItem) => {
    try {
      const quantity = getItemQuantity(menuItem.id);
      if (!currentOrder) {
        // Create new order
        const newOrder = await orderService.createOrder({
          tableNumber: table.number.toString(),
          orderType: 'DINE_IN', // Default to DINE_IN for table orders
          items: [{
            menuItemId: menuItem.id,
            quantity,
            notes: '',
            modifiers: ''
          }]
        });
        setCurrentOrder(newOrder);
      } else {
        // Check if item already exists in the order
        const existingItem = currentOrder.items.find(item => item.menuItem.id === menuItem.id);
        
        if (existingItem) {
          // Update existing item quantity
          const updatedOrder = await orderService.updateItemQuantity(
            currentOrder.id,
            existingItem.menuItemId,
            existingItem.quantity + quantity
          );
          setCurrentOrder(updatedOrder);
        } else {
          // Add as new item
          const updatedOrder = await orderService.addItemToOrder(currentOrder.id, {
            menuItemId: menuItem.id,
            quantity,
            notes: '',
            modifiers: ''
          });
          setCurrentOrder(updatedOrder);
        }
      }
      // Reset quantity after adding
      setNewItemQuantities(prev => ({
        ...prev,
        [menuItem.id]: 0
      }));
      // Don't call onOrderUpdate here as it causes loading state that looks like page reload
    } catch (err) {
      setError('Failed to add item to order');
      console.error(err);
    }
  };

  const handleRemoveItem = async (menuItemId: string) => {
    try {
      if (currentOrder) {
        const updatedOrder = await orderService.removeItemFromOrder(currentOrder.id, menuItemId);
        setCurrentOrder(updatedOrder);
        // Don't call onOrderUpdate here as it causes loading state that looks like page reload
      }
    } catch (err) {
      setError('Failed to remove item from order');
      console.error(err);
    }
  };

  const handleUpdateQuantity = async (menuItemId: string, quantity: number) => {
    try {
      if (currentOrder) {
        if (quantity <= 0) {
          await handleRemoveItem(menuItemId);
        } else {
          const updatedOrder = await orderService.updateItemQuantity(currentOrder.id, menuItemId, quantity);
          setCurrentOrder(updatedOrder);
          // Don't call onOrderUpdate here as it causes loading state that looks like page reload
        }
      }
    } catch (err) {
      setError('Failed to update item quantity');
      console.error(err);
    }
  };

  const printComponentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the bill');
        return;
      }
      
      if (printWindow && currentOrder) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Bill - Table ${table.number}</title>
              <style>
                @page {
                  size: 80mm auto;  /* Standard thermal paper width */
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 80mm;  /* Standard thermal paper width */
                  background: white;
                }
                .print-content {
                  padding: 5mm;
                }
                @media print {
                  html, body {
                    width: 80mm;
                    height: auto;
                  }
                  .no-print { 
                    display: none; 
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-content">
                ${printComponentRef.current?.innerHTML || ''}
              </div>
              <div class="no-print" style="text-align: center; margin: 20px;">
                <p>If the print dialog doesn't appear automatically, please press Ctrl+P (or Cmd+P on Mac) to print.</p>
                <button onclick="window.print()" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer;">
                  Print Bill
                </button>
              </div>
              <script>
                window.onload = () => {
                  window.print();
                  window.onafterprint = () => window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to open print window. Please check if popups are blocked.');
    }
  };

  const handleSettleBill = async () => {
    try {
      if (currentOrder) {
        handlePrint();
        await orderService.updateOrderStatus(currentOrder.id, 'BILLED');
        setCurrentOrder(null);
        onOrderUpdate();
        onClose();
      }
    } catch (err) {
      setError('Failed to settle bill');
      console.error(err);
    }
  };

  const menuColumns = [
    { header: 'Item', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Price', 
      accessor: 'price', 
      render: (value: number) => (
        <div className="font-semibold">₹{(value || 0).toFixed(2)}</div>
      )
    },
    {
      header: 'Quantity',
      accessor: 'id',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(value, getItemQuantity(value) - 1)}
            className="bg-gray-200 px-2 rounded hover:bg-gray-300"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={getItemQuantity(value)}
            onChange={(e) => handleQuantityChange(value, parseInt(e.target.value) || 1)}
            className="w-16 text-center border rounded"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(value, getItemQuantity(value) + 1)}
            className="bg-gray-200 px-2 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      ),
    },
    {
      header: 'Subtotal',
      accessor: 'price',
      render: (value: number, row: MenuItem) => (
        <div className="font-semibold">
          ₹{(getItemQuantity(row.id) * (value || 0)).toFixed(2)}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (value: string, row: MenuItem) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddItem(row);
          }}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Add
        </button>
      ),
    },
  ];

  const orderColumns = [
    { 
      header: 'Item', 
      accessor: 'menuItem',
      render: (value: MenuItem) => value.name
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (value: number, row: OrderItem) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleUpdateQuantity(row.menuItemId, value - 1)}
            className="bg-gray-200 px-2 rounded"
          >
            -
          </button>
          <span>{value}</span>
          <button
            type="button"
            onClick={() => handleUpdateQuantity(row.menuItemId, value + 1)}
            className="bg-gray-200 px-2 rounded"
          >
            +
          </button>
        </div>
      ),
    },
    { 
      header: 'Price', 
      accessor: 'price', 
      render: (value: number) => `₹${(value || 0).toFixed(2)}` 
    },
    {
      header: 'Subtotal',
      accessor: 'price',
      render: (value: number, row: OrderItem) => `₹${((row.quantity || 0) * (value || 0)).toFixed(2)}`,
    },
    {
      header: 'Action',
      accessor: 'menuItemId',
      render: (value: string) => (
        <button
          type="button"
          onClick={() => handleRemoveItem(value)}
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Table {table.number}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Menu Search */}
          <div className="flex-1">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Search Menu Items
                  </label>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="flex-1 relative">
                      <input
                        id="search"
                        type="text"
                        placeholder="Search by name, category, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                      />
                      {searchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-64">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                        disabled={searchLoading}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Table
                columns={menuColumns}
                data={menuItems}
              />
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-gray-500">Loading...</div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Current Order */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-xl font-semibold mb-4">Current Order</h3>
            {currentOrder ? (
              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>₹{item.price.toFixed(2)} × {item.quantity}</span>
                        <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                          className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                          className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.menuItemId)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{((currentOrder.total || 0) - (currentOrder.tax || 0) - (currentOrder.serviceCharge || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Charge:</span>
                    <span>₹{(currentOrder.serviceCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{(currentOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{(currentOrder.total || 0).toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSettleBill}
                    className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  >
                    Settle Bill
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No current order. Add items from the menu to start an order.
              </div>
            )}
          </div>
        </div>

        {/* Hidden print component */}
        <div style={{ display: 'none' }} className="print-content">
          <div ref={printComponentRef}>
            {currentOrder && (
              <BillPrint order={currentOrder} tableNumber={table.number} />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TableOrderModal; 
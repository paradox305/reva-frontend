import React, { useState, useEffect } from 'react';
import { menuService, MenuCategory } from '../services/menuService';
import { MenuItem, CreateMenuItemDto } from '../types/menu';

const PREDEFINED_CATEGORIES = [
  { id: 'BEVERAGES', name: 'Beverages' },
  { id: 'COCKTAILS', name: 'Cocktails' },
  { id: 'WINE', name: 'Wine' },
  { id: 'BEER', name: 'Beer' },
  { id: 'SPIRITS', name: 'Spirits' },
  { id: 'SNACKS', name: 'Snacks' },
  { id: 'APPETIZERS', name: 'Appetizers' },
  { id: 'MAIN_COURSE', name: 'Main Course' },
  { id: 'DESSERTS', name: 'Desserts' }
] as const;

type CategoryId = typeof PREDEFINED_CATEGORIES[number]['id'];

interface EditMenuItemForm {
  id?: string;
  name: string;
  description?: string;
  category: CategoryId | '';
  price: number;
  isAvailable: boolean;
  department: 'BAR' | 'KITCHEN';
  inventoryCount: number;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditMenuItemForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories()
      ]);
      // Filter out any items that don't exist in the backend
      const validItems = itemsData.filter(item => item && item.id);
      setMenuItems(validItems);
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMenuItems([]);
        setError('No menu items found');
      } else {
        setError('Failed to load menu data: ' + err.message);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({
      ...item,
      category: PREDEFINED_CATEGORIES.find(cat => cat.id === item.category)
        ? (item.category as CategoryId)
        : PREDEFINED_CATEGORIES[0].id
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenuItem(id);
        setMenuItems(prev => prev.filter(item => item.id !== id));
        setError(null);
      } catch (err: any) {
        if (err.message.includes('not found')) {
          setMenuItems(prev => prev.filter(item => item.id !== id));
          setError('Menu item no longer exists. The list has been updated.');
        } else {
          setError('Failed to delete menu item: ' + err.message);
        }
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const menuItemData: CreateMenuItemDto = {
        name: editingItem.name,
        description: editingItem.description,
        category: editingItem.category,
        price: editingItem.price,
        isAvailable: editingItem.isAvailable,
        department: editingItem.department,
        inventoryCount: editingItem.inventoryCount,
      };

      if (editingItem.id) {
        await menuService.updateMenuItem(editingItem.id, menuItemData);
      } else {
        await menuService.createMenuItem(menuItemData);
      }
      await loadData();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError('Failed to save menu item');
      console.error(err);
    }
  };

  const handleAddNew = () => {
    setEditingItem({
      name: '',
      price: 0,
      category: '',
      description: '',
      isAvailable: true,
      department: 'BAR',
      inventoryCount: 0,
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-4">Loading...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white px-5 py-3 rounded hover:bg-blue-600 text-base"
        >
          Add New Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                )}
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Category</div>
                <div className="text-gray-900">
                  {PREDEFINED_CATEGORIES.find((cat) => cat.id === item.category)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Price</div>
                <div className="text-gray-900 font-medium">₹{item.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Department</div>
                <div className="text-gray-900">{item.department}</div>
              </div>
              <div>
                <div className="text-gray-500">Inventory</div>
                <div className="text-gray-900">{item.inventoryCount}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-6">
              <button
                onClick={() => handleEdit(item)}
                className="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {PREDEFINED_CATEGORIES.find(cat => cat.id === item.category)?.name || 'Unknown Category'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-gray-900 font-medium">
                        ₹{item.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-full sm:max-w-lg p-6 mx-0 sm:mx-0 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingItem?.name || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => prev ? { ...prev, name: e.target.value } : null)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editingItem?.category || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => prev ? { ...prev, category: e.target.value as CategoryId | '' } : null)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  required
                >
                  <option value="">Select Category</option>
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem?.price || 0}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, price: parseFloat(e.target.value) } : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingItem?.description || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => prev ? { ...prev, description: e.target.value } : null)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-4 min-h-28"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={editingItem?.department || 'BAR'}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, department: e.target.value as 'BAR' | 'KITCHEN' } : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  required
                >
                  <option value="BAR">Bar</option>
                  <option value="KITCHEN">Kitchen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inventory Count</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={editingItem?.inventoryCount ?? 0}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, inventoryCount: Math.max(0, parseInt(e.target.value || '0', 10)) } : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingItem?.isAvailable || false}
                  onChange={(e) =>
                    setEditingItem((prev) => prev ? { ...prev, isAvailable: e.target.checked } : null)
                  }
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Available</label>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu; 
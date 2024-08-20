"use client";

import axiosInstance from "@/utils/api";
import React, { useState, useEffect } from "react";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [CreateMenu, setCreateMenu] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    try {
      const response = await axiosInstance.get("/employee/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setError("Error fetching menu items. Please try again.");
    }
  };
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.patch(`/admin/menu/${selectedItem.id}`, selectedItem);
      setMenuItems(
        menuItems.map((item) =>
          item.id === selectedItem.id ? selectedItem : item
        )
      );
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error updating menu item:", error);
      setError("Error updating menu item. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/admin/menu/${selectedItem.id}`);
      setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id));
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      setError("Error deleting menu item. Please try again.");
    }
  };

  // Function to handle adding a new menu item
  const handleAddMenu = async () => {
    try {
      // Make API call to add menu item
      const response = await axiosInstance.post("/admin/menu", CreateMenu);

      fetchMenuItems();
      // Clear new menu item state

      // Close the popup
      setIsCreatePopupOpen(false);
      setCreateMenu(null);
    } catch (error) {
      console.error("Error adding menu item:", error);
      setError("Error adding menu item. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Restaurant Menu</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => setIsCreatePopupOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Menu Item
      </button>
      {/* Pop-up for adding new menu item */}
      {isCreatePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-gray-500">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-2xl mb-4">Add Menu Item</h2>
            <label className="block mb-2">
              Item Name:
              <input
                type="text"
                onChange={(e) =>
                  setCreateMenu({ ...CreateMenu, itemName: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </label>
            <label className="block mb-2">
              Category:
              <select
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) =>
                  setCreateMenu({ ...CreateMenu, category: e.target.value })
                }
              >
                <option value="" selected>
                  Choose from list
                </option>
                <option value="Dish">Dish</option>
                <option value="Snacks">Snacks</option>
                <option value="Alcohol">Alcohol</option>
                <option value="Drinks">Drinks</option>
                <option value="Others">Others</option>
              </select>
            </label>
            <label className="block mb-2">
              Quantity:
              <input
                type="number"
                onChange={(e) =>
                  setCreateMenu({
                    ...CreateMenu,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </label>
            <label className="block mb-2">
              Price:
              <input
                type="number"
                onChange={(e) =>
                  setCreateMenu({
                    ...CreateMenu,
                    price: Number(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </label>
            {/* Add other input fields for category, price, and quantity */}
            {/* Include appropriate onChange handlers */}
            {/* ... */}
            <div className="flex justify-end">
              {/* Button to add the new menu item */}
              <button
                onClick={handleAddMenu}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Add
              </button>
              {/* Button to close the pop-up */}
              <button
                onClick={() => setIsCreatePopupOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Name
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {menuItems.map((item) => (
            <tr
              key={item.id}
              onClick={() => handleRowClick(item)}
              className="cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-gray-500 ">
                {item.itemName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {item.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-gray-500">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-2xl mb-4">Edit Menu Item</h2>
            <label className="block mb-2">
              Item Name:
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedItem.itemName}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, itemName: e.target.value })
                }
              />
            </label>
            <label className="block mb-2">
              Category:
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedItem.category}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, category: e.target.value })
                }
              >
                <option value="Dish">Dish</option>
                <option value="Snacks">Snacks</option>
                <option value="Alcohol">Alcohol</option>
                <option value="Drinks">Drinks</option>
                <option value="Others">Others</option>
              </select>
            </label>
            <label className="block mb-2">
              Quantity:
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedItem.quantity}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </label>
            <label className="block mb-4">
              Price:
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedItem.price}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    price: Number(e.target.value),
                  })
                }
              />
            </label>
            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;

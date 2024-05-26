// app/pages/orders.js
"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/utils/api";

const Orders = ({ params }) => {
  const [tableData, setTableData] = useState(null);
  const [Session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [Orders, setOrders] = useState(null);
  const [total, setTotal] = useState(0);
  const [quantities, setQuantities] = useState(1);

  const fetchTableData = async () => {
    try {
      const response = await axiosInstance.get(
        `/employee/table/${params.tableId}`
      );
      let data = response.data;
      setTableData(data);
      if (data.Session.length) {
        setSession(data.Session[0].id);
        // Step 1: Group Orders by Menu Item
        let price = 0;
        const groupedOrders = data.Session[0].Order.reduce((acc, order) => {
          const menuId = order.Menu.id;

          if (!acc[menuId]) {
            acc[menuId] = {
              itemName: order.Menu.itemName,
              category: order.Menu.category,
              totalQuantity: 0,
              totalPrice: 0,
            };
          }

          acc[menuId].totalQuantity += 1;
          acc[menuId].totalPrice += order.Menu.price;
          price += order.Menu.price;

          return acc;
        }, {});

        const aggregatedOrders = Object.values(groupedOrders);
        setOrders(aggregatedOrders);
        setTotal(price);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      setError("Error fetching table data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTableData();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axiosInstance.get(`/employee/menu`);
        setMenuItems(response.data);
        setFilteredMenuItems(response.data); // Initialize filteredMenuItems with all menu items
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setError("Error fetching menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filteredItems = menuItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm)
    );
    setFilteredMenuItems(filteredItems);
  };

  const handleQuantityChange = (quantity) => {
    setQuantities(quantity);
  };

  const createOrder = async (menuId) => {
    try {
      let sessionId = null;
      if (!tableData.Session.length) {
        const response = await axiosInstance.post(`/employee/session`, {
          tableId: tableData.id,
          // Add other necessary order data here
        });
        console.log(response.data.id);
        sessionId = response.data.id;
        setSession(sessionId);
      }
      const response = await axiosInstance.post(`/employee/order`, {
        sessionId: Session ? Session : sessionId,
        quantity: quantities,
        menuId,
        // Add other necessary order data here
      });
      fetchTableData();
      setSearchTerm("");
      // Handle success, e.g., show a success message or update state
    } catch (error) {
      console.error("Error creating order:", error);
      // Handle error, e.g., show an error message or update state
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axiosInstance.post(
        `/employee/session/checkout/${tableData.id}`
      );
      console.log("Checkout successful:", response.data);
      fetchTableData();
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  console.log(Orders);
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Orders for Table {tableData?.number}
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded text-black-500 bg-gray-500"
          />
        </div>
        <div className="min-w-20 mb-5">
          <p className="font-bold">Quantity:</p>
          <input
            type="number"
            min="1"
            value={quantities}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            className="w-36 p-2 border border-gray-300 rounded text-black bg-slate-400"
          />
        </div>
        <div className="flex flex-col">
          {searchTerm.length > 0 && (
            <div className="flex flex-col">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 border rounded shadow-md p-4 flex justify-between items-center"
                >
                  <h2 className="text-xl min-w-96">{item.itemName}</h2>
                  <div className="flex flex-wrap mt-2">
                    {/* Move the price data into its own column */}
                    <div className="min-w-20">
                      <p className="font-bold">Price:</p>
                      <p>{item.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      createOrder(item.id);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
                  >
                    Add Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {tableData && (
          <div>
            <p>Table Number: {tableData.number}</p>
            <p>Type: {tableData.type}</p>
            <h2>Session Details:</h2>
            {tableData.Session.map((session) => (
              <div key={session.id}>
                <p>Session ID: {session.id}</p>
                <p>Discount: {session.discount}</p>
                <p>Created At: {session.createdAt}</p>
                {/* Display other session details as needed */}
                <div className="mt-5">
                  <table className="min-w-full bg-gray-500">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-700">
                          Item Name
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-700">
                          Category
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-700">
                          Quantity
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-700">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Orders.map((order) => (
                        <tr key={order.itemName}>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {order.itemName}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {order.category}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {order.totalQuantity}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {order.totalPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={handleCheckout} // Replace with actual menuId
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  >
                    To Pay : {`${total}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

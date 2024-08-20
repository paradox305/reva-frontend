"use client";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/utils/api";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because getMonth() returns zero-based month
  const day = String(currentDate.getDate()).padStart(2, "0");

  const defaultDate = `${year}-${month}-${day}`;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState(defaultDate);
  const [toDate, setToDate] = useState(defaultDate);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const formatDate = (originalDate) => {
          // Convert string to Date object
          const date = new Date(originalDate);

          // Subtract one day
          date.setDate(date.getDate() - 1);

          // Format the date back to the desired format
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");

          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

          console.log(formattedDate); // Output: 2024-05-24T03:11
          return formattedDate;
        };
        const response = await axiosInstance.get("/admin/orders", {
          params: {
            from: formatDate(fromDate),
            to: formatDate(toDate),
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [fromDate, toDate]);

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <div className="flex justify-center">
          <div className="flex flex-col items-center mr-4">
            <label className="block mb-2">From Date:</label>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-60 p-2 border border-gray-300 rounded bg-slate-400"
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="block mb-2">To Date:</label>
            <input
              type="datetime-local"
              value={toDate}
              onChange={handleToDateChange}
              className="w-60 p-2 border border-gray-300 rounded  bg-slate-400"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-center">
          {orders.map((order) => (
            <div
              key={order.itemName}
              className="bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg rounded-lg overflow-hidden m-4"
            >
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{order.itemName}</h2>
                <p className="text-gray-700">
                  Total Quantity: {order.totalQuantity}
                </p>
                <p className="text-gray-700">Total Price: {order.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

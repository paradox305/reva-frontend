// app/SessionsPage.js
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/utils/api"; // Adjust the import path to your api utility
import OrdersPage from "@/components/OrdersPage";
import Link from "next/link";

const SessionsPage = () => {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState(null);

  useEffect(() => {
    // Fetch tables data from the API
    const fetchTables = async () => {
      try {
        const response = await axiosInstance.get("/employee/table");
        setTables(response.data);
      } catch (error) {
        console.error("Error fetching tables:", error);
        setError("Error fetching tables. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Function to handle table click
  const handleTableClick = (tableId) => {
    console.log(tableId);
    setSelectedTableId(tableId);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Sessions</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className="p-4 border rounded shadow-md"
                onClick={() => handleTableClick(table.id)}
              >
                <h2 className="text-xl font-bold mb-2">Table {table.number}</h2>
                <p>Type: {table.type}</p>
                <p
                  className={
                    table.Session.length > 0 ? "text-red-500" : "text-green-500"
                  }
                >
                  Status: {table.Session.length > 0 ? "Active" : "Inactive"}
                </p>
                {selectedTableId === table.id && (
                  <Link href={`/sessions/orders/${table.id}`}>
                    <span className="text-blue-500 hover:underline">
                      Add Orders
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;

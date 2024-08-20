// app/OrdersPage.js
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const OrdersPage = ({ tableId }) => {
  const router = useRouter();

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Orders for Table {tableId}</h1>
        {/* Add your orders form or content here */}
      </div>
    </div>
  );
};

export default OrdersPage;

// components/Navbar.js
import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          Reva Bar And Restaurant
        </div>
        <div className="space-x-4">
          <Link href="/menu">
            <span className="text-white hover:text-gray-300">Menu</span>
          </Link>
          <Link href="/sessions">
            <span className="text-white hover:text-gray-300">Tables</span>
          </Link>
          <Link href="/history">
            <span className="text-white hover:text-gray-300">Analytics</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

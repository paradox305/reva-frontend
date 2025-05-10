import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/' },
    { icon: '🛏️', label: 'Rooms', path: '/rooms' },
    { icon: '📝', label: 'Reservations', path: '/reservations' },
    { icon: '👥', label: 'Guests', path: '/guests' },
    { icon: '🍽️', label: 'Restaurant', path: '/restaurant' },
    { icon: '🍸', label: 'Bar', path: '/bar' },
    { icon: '📦', label: 'Inventory', path: '/inventory' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-800 text-white p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hotel Manager</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 
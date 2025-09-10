// src/components/BottomNavBar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, User, PlusCircle } from 'lucide-react';

const BottomNavBar = () => {
  // A mock for user authentication state.
  const isAuthenticated = localStorage.getItem('token');
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-slate-900 border-t border-gray-700 text-gray-400 z-50">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className="flex flex-col items-center justify-center space-y-1 hover:text-white">
          <Home size={20} />
          <span className="text-xs">Home</span>
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/jobs/new" className="flex flex-col items-center justify-center space-y-1 hover:text-white">
              <PlusCircle size={20} />
              <span className="text-xs">Post</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center justify-center space-y-1 hover:text-white">
              <LayoutDashboard size={20} />
              <span className="text-xs">Dash</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center justify-center space-y-1 hover:text-white">
              <User size={20} />
              <span className="text-xs">Profile</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default BottomNavBar;
// src/components/AppHeader.jsx

import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, User, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const AppHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <Link to="/" className="flex items-center space-x-2">
          <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold">Job Sethu</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
            </>
          )}
        </div>

        {/* Auth and Action Buttons for Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <Link to="/jobs/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-colors">
              Post a Job
            </Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
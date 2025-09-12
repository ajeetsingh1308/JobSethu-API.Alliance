import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, User, LayoutDashboard, LogIn, LogOut, PlusCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const AppHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        handleLogout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold">Job Sethu</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors focus:outline-none focus:border-blue-500">
                <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name || 'U'}&background=3b82f6&color=fff`} alt="User Avatar" className="w-full h-full object-cover"/>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-700"><p className="text-sm text-white font-semibold">{user.full_name}</p><p className="text-xs text-gray-400 truncate">{user.email}</p></div>
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><User size={16} className="mr-3"/> My Profile</Link>
                  <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><LayoutDashboard size={16} className="mr-3"/> My Dashboard</Link>
                  <Link to="/jobs/new" onClick={() => setIsDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><PlusCircle size={16} className="mr-3"/> Post a Job</Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"><LogOut size={16} className="mr-3"/> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <LogIn size={20} /><span>Login / Sign Up</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AppHeader;
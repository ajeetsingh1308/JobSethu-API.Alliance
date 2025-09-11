// src/pages/AuthPages.jsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

const AuthPages = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin ? 'login' : 'signup';
    const payload = isLogin
      ? { email, password }
      : { email, password, full_name: fullName };

    try {
      const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `An error occurred during ${endpoint}.`);
      }

      if (isLogin) {
        // Store JWT token and user data in local storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login successful!');
        navigate('/'); // <-- CHANGE THIS LINE
      } else {
        setMessage('Account created successfully! You can now log in.');
        navigate('/login'); // Redirect to login page
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            {isLogin ? 'Log In' : 'Sign Up'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 hover:underline">
                  Sign Up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:underline">
                  Log In
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPages;
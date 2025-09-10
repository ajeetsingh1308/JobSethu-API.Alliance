// src/pages/PaymentPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Fetch job details to display on the payment page
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details.');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, navigate]);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!job || !token) return;

    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${id}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment order.');
      }
      const order = await response.json();
      
      // Load Razorpay checkout script (this is a mock implementation for now)
      alert(`Razorpay Checkout initialized for Order ID: ${order.order_id} with amount: ${order.amount}`);
      console.log('Razorpay Order:', order);
      
      // In a real app, you would initialize the Razorpay popup here
      // const options = {
      //   key: order.razorpay_key_id,
      //   amount: order.amount,
      //   order_id: order.order_id,
      //   handler: function (response) {
      //     // Handle successful payment here
      //     alert('Payment successful!');
      //   },
      // };
      // const rzp1 = new window.Razorpay(options);
      // rzp1.open();
      
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading payment page...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  if (!job) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Job not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white text-center">Confirm Payment</h1>
          <p className="text-gray-400 text-center">You are about to make a payment for the following job posting:</p>
          
          <div className="border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-2">{job.title}</h2>
            <div className="flex justify-between text-gray-400">
              <span>Amount:</span>
              <span className="font-bold text-white">₹{job.amount / 100}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Pay Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
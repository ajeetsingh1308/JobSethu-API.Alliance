// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import { Briefcase, FileText } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('postings'); // 'postings' or 'applications'
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const endpoint = view === 'postings' ? 'postings' : 'applications';
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${view}`);
        }

        const data = await response.json();
        if (view === 'postings') {
          setPostings(data);
        } else {
          setApplications(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, view]);

  const handleCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
  
  const currentData = view === 'postings' ? postings : applications;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-white mb-6">My Dashboard</h1>
        
        <div className="flex space-x-2 border-b border-gray-700 mb-8">
          <button
            onClick={() => setView('applications')}
            className={`px-4 py-2 flex items-center space-x-2 text-lg font-semibold transition-colors duration-200 ${view === 'applications' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText size={20} />
            <span>My Applications</span>
          </button>
          <button
            onClick={() => setView('postings')}
            className={`px-4 py-2 flex items-center space-x-2 text-lg font-semibold transition-colors duration-200 ${view === 'postings' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Briefcase size={20} />
            <span>My Postings</span>
          </button>
        </div>
        
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">Error: {error}</div>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.length > 0 ? (
              currentData.map((job) => (
                <JobCard key={job.id} job={job} onClick={handleCardClick} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                You have no {view} yet.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
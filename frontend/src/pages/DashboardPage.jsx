// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import { Briefcase, FileText } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('postings'); // 'postings' or 'applications'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for demonstration purposes
  const mockPostings = [
    {
      id: "job-1",
      title: "Report on burial of well",
      description: "We need a detailed report on the proper burial of a well, including photographic evidence of the process and adherence to local regulations. The report should ensure we're in compliance...",
      location: "Quepem, Goa",
      amount: "500",
      skills_required: ["Technical Reporting", "Environmental Compliance"],
      image_url: "https://images.unsplash.com/photo-1549419149-1d48c8b6d859?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      posted_days_ago: "8 days ago",
      status: "completed",
    },
    {
      id: "job-2",
      title: "WEB DEVELOPMENT",
      description: "Responsible for designing, developing, and maintaining websites and web applications using modern web technologies. Ensures responsive design, functionality, and user-friendliness...",
      location: "Mumbai",
      amount: "1500",
      skills_required: ["html", "css", "js", "+5 more"],
      image_url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2715&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      posted_days_ago: "14 days ago",
      status: "assigned",
    },
    // Add more mock postings
  ];

  const mockApplications = [
    {
      id: "app-1",
      title: "Data Analyst",
      description: "twinkle twinkle little star",
      location: "Nalasopara, Mumbai",
      amount: "5000",
      skills_required: ["Python", "MySql"],
      image_url: "https://images.unsplash.com/photo-1550009158-9fb12b8764a8?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      posted_days_ago: "14 days ago",
      status: "assigned",
    },
    // Add more mock applications
  ];

  // Fetch user data and associated jobs/applications
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      // In a real application, you would fetch user's postings/applications from the backend.
      // For now, we'll just use the mock data.
      setLoading(false);
    } catch (err) {
      setError('Failed to parse user data from local storage.');
      setLoading(false);
    }

  }, [navigate]);

  const handleCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading dashboard...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-white mb-6">My Dashboard</h1>
        
        {/* View Switcher Tabs */}
        <div className="flex space-x-2 border-b border-gray-700 mb-8">
          <button
            onClick={() => setView('applications')}
            className={`px-4 py-2 flex items-center space-x-2 text-lg font-semibold transition-colors duration-200
              ${view === 'applications' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText size={20} />
            <span>My Applications</span>
          </button>
          <button
            onClick={() => setView('postings')}
            className={`px-4 py-2 flex items-center space-x-2 text-lg font-semibold transition-colors duration-200
              ${view === 'postings' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Briefcase size={20} />
            <span>My Postings</span>
          </button>
        </div>
        
        {/* Display Content based on the selected view */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {view === 'postings' && mockPostings.map((job) => (
            <JobCard key={job.id} job={job} onClick={handleCardClick} />
          ))}
          {view === 'applications' && mockApplications.map((job) => (
            <JobCard key={job.id} job={job} onClick={handleCardClick} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
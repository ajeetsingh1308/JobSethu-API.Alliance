// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/jobs');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setJobs(data.jobs); // The API response has a 'jobs' array
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
  
  // A mock job object to display something while fetching
  const mockJob = {
    id: "j1a2b3c4-...",
    title: "Need help with garden weeding",
    description: "Looking for someone to help clear out weeds from my vegetable patch. This is a short-term gig for a few hours. No prior experience is needed, just a willingness to work outdoors.",
    location: "Vasco, Goa",
    amount: "500",
    skills_required: ["Gardening", "Manual Labor", "Outdoors"],
    image_url: "https://images.unsplash.com/photo-1549419149-1d48c8b6d859?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    posted_days_ago: "3 days ago",
    status: "open",
  };

  if (loading) return <div className="text-center py-10">Loading jobs...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        {/* Hero & Search Section */}
        <section className="text-center py-16 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Browse through hundreds of local jobs and find the perfect fit for your skills.
          </p>
          <div className="max-w-xl mx-auto flex items-center bg-gray-800 rounded-full shadow-lg p-2">
            <input
              type="text"
              placeholder="Search for jobs, skills, or keywords..."
              className="flex-1 px-4 py-2 bg-transparent text-white focus:outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors">
              Search
            </button>
          </div>
        </section>

        {/* Recent Jobs Section */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-white mb-6">Recent Jobs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Displaying mock data for now, replace with API data later */}
            <JobCard job={mockJob} onClick={handleCardClick} />
            <JobCard job={mockJob} onClick={handleCardClick} />
            <JobCard job={mockJob} onClick={handleCardClick} />
            {/* Render fetched jobs when the API is live
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={handleCardClick} />
            ))}
            */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
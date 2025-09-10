// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobsAndCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/api/jobs');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setJobs(data.jobs);

        // Extract unique categories from the fetched jobs
        const allCategories = data.jobs.map(job => job.category).filter(Boolean);
        const uniqueCategories = ["All", ...new Set(allCategories)];
        setCategories(uniqueCategories);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobsAndCategories();
  }, []);

  const handleCardClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const filteredJobs = selectedCategory === "All"
    ? jobs
    : jobs.filter(job => job.category === selectedCategory);

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
        
        {/* Job Categories Filter */}
        <section className="py-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors
                  ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Recent Jobs Section */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-white mb-6">Recent Jobs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={handleCardClick} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
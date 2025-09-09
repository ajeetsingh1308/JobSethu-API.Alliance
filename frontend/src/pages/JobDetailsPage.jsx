// src/pages/JobDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { MapPin, IndianRupee, Clock, Briefcase, ChevronLeft } from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
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
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading job details...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  }

  if (!job) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
            <ChevronLeft size={20} className="mr-1" /> Back to Jobs
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{job.title}</h1>
          
          <div className="flex items-center text-gray-400 mb-6 space-x-4">
            <div className="flex items-center">
              <MapPin size={18} className="mr-2 text-blue-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center">
              <IndianRupee size={18} className="mr-2 text-green-400" />
              <span>{job.amount}</span>
            </div>
            <div className="flex items-center">
              <Clock size={18} className="mr-2 text-gray-500" />
              <span>{job.posted_days_ago}</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-white mb-3">Description</h2>
          <p className="text-gray-400 mb-6">{job.description}</p>
          
          <h2 className="text-2xl font-semibold text-white mb-3">Skills Required</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {job.skills_required.map((skill, index) => (
              <span key={index} className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-700">
            {/* The apply button will be dynamic based on user status */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-colors flex items-center space-x-2">
              <Briefcase size={20} />
              <span>Apply for this Job</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;
// src/pages/CreateJobPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { Sparkles, ImageDown, SendHorizonal, AlertTriangle, CloudUpload } from 'lucide-react';

// A hardcoded list of categories for the dropdown menu
const jobCategories = ["IT", "Manual Labor", "Creative", "Tutoring", "Admin"];

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills_required: '',
    amount: '',
    location: '',
    category: '', // Added a category field
    isUrgent: false,
    image_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAiSuggest = async () => {
    if (!formData.title) {
      setError("Please enter a job title first.");
      return;
    }
    setAiLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/ai/suggest-job-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get AI suggestions.');
      }
      
      const data = await response.json();
      setFormData((prevData) => ({
        ...prevData,
        description: data.description,
        skills_required: data.skills.join(', '),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImage = async () => {
    if (!formData.title) {
      setError("Please enter a job title to generate an image.");
      return;
    }
    setAiLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-job-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: formData.title }),
      });
      const data = await response.json();
      setFormData((prevData) => ({
        ...prevData,
        image_url: data.image_url,
      }));
    } catch (err) {
      setError('Failed to generate image.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = (e) => {
    console.log('File selected:', e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const jobData = {
      ...formData,
      skills_required: formData.skills_required.split(',').map(s => s.trim()),
      amount: parseInt(formData.amount, 10),
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to post job.');
      }
      
      const newJob = await response.json();
      alert('Job posted successfully!');
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          Create a New Job
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Fill out the details below to post a job listing.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Build a responsive website"
              required
            />
            <p className="mt-2 text-sm text-gray-500">Start with a clear title. You can use the AI assistant to fill in the rest.</p>
          </div>

          {/* Job Details with AI Button */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-400">Job Details</label>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} className="mr-2" />
                {aiLoading ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Provide a detailed description of the job requirements."
              required
            ></textarea>
          </div>
          
          {/* Required Skills */}
          <div>
            <label htmlFor="skills_required" className="block text-sm font-medium text-gray-400 mb-2">Required Skills</label>
            <input
              type="text"
              id="skills_required"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., React, Plumbing, Graphic Design"
              required
            />
            <p className="mt-2 text-sm text-gray-500">Enter skills separated by commas.</p>
          </div>
          
          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="" disabled>Select a category</option>
              {jobCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Job Image */}
          <div>
            <label htmlFor="job-image" className="block text-sm font-medium text-gray-400 mb-2">Job Image</label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleAiImage}
                disabled={aiLoading}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 rounded-lg transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <ImageDown size={16} />
                <span>Generate with AI</span>
              </button>
              <label htmlFor="image-upload" className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 rounded-lg transition-colors cursor-pointer">
                <CloudUpload size={16} />
                <span>Upload your own</span>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          {formData.image_url && (
            <div className="mt-4">
              <img src={formData.image_url} alt="AI generated job" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          {/* Payment & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-2">Payment (INR)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., 5000"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Panjim, Goa"
                required
              />
            </div>
          </div>

          {/* Mark as Urgent Toggle */}
          <div className="flex items-start space-x-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <AlertTriangle size={20} className="text-red-500 mt-1" />
            <div className="flex-1">
              <h4 className="text-white font-semibold">Mark as SOS (Urgent)</h4>
              <p className="text-sm text-gray-500">Enable this if the job needs immediate attention. It will be highlighted.</p>
            </div>
            <label htmlFor="isUrgent" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isUrgent"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {error && (
            <div className="p-4 text-center text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              'Posting Job...'
            ) : (
              <>
                <span>Create Job</span>
                <SendHorizonal size={20} />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateJobPage;
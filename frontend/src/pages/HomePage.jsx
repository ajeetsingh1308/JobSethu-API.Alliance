import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs?page=1&limit=20`);
        if (!response.ok) throw new Error('Could not load categories');
        const data = await response.json();
        const allCategories = data.jobs.map(job => job.category).filter(Boolean);
        const uniqueCategories = ["All", ...new Set(allCategories)];
        setCategories(uniqueCategories);
      } catch (err) { console.error("Failed to fetch categories:", err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs?page=${page}&limit=9&category=${selectedCategory}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setJobs(prevJobs => (page === 1 ? data.jobs : [...prevJobs, ...data.jobs]));
        setHasMore(data.has_more);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchJobs();
  }, [page, selectedCategory]);

  const handleCardClick = (jobId) => navigate(`/jobs/${jobId}`);
  const handleCategoryClick = (category) => {
    if (selectedCategory !== category) {
      setSelectedCategory(category);
      setPage(1);
      setJobs([]);
    }
  };
  const loadMoreJobs = () => hasMore && setPage(prevPage => prevPage + 1);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <section className="text-center py-16 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Next Opportunity</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">Browse local jobs and find the perfect fit for your skills.</p>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Link to="/jobs/new" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors">Post a Job</Link>
          </div>
          <div className="max-w-xl mx-auto flex items-center bg-gray-800 rounded-full shadow-lg p-2">
            <input type="text" placeholder="Search for jobs, skills, or keywords..." className="flex-1 px-4 py-2 bg-transparent text-white focus:outline-none"/>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors">Search</button>
          </div>
        </section>
        <section className="py-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (<button key={category} onClick={() => handleCategoryClick(category)} className={`px-4 py-2 rounded-full font-semibold transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{category}</button>))}
          </div>
        </section>
        <section id="recent-jobs" className="py-10">
          <h2 className="text-3xl font-bold text-white mb-6">Recent Jobs</h2>
          {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (<JobCard key={`${job.id}-${Math.random()}`} job={job} onClick={handleCardClick} />))}
          </div>
          <div className="text-center mt-12">
            {loading && <p>Loading...</p>}
            {!loading && hasMore && <button onClick={loadMoreJobs} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full transition-colors">Load More</button>}
            {!loading && !hasMore && jobs.length > 0 && <p className="text-gray-500">You've reached the end of the list.</p>}
            {!loading && !hasMore && jobs.length === 0 && <p className="text-gray-500">No jobs found in this category.</p>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
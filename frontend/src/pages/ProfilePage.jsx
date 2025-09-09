// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { MapPin, Briefcase, CalendarDays, Edit } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    location: '',
    about: '',
    skills: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile data.');
        }
        const data = await response.json();
        setUser(data);
        setProfileData({
          full_name: data.full_name,
          location: data.location?.name || '', // Use optional chaining to prevent error
          about: 'Interested in capturing candid moments that shows the real essence of life', // Mock data for now
          skills: data.skills ? data.skills.join(', ') : '',
          avatar_url: data.avatar_url || 'https://via.placeholder.com/150',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    // Prepare data for API call
    const updatedData = {
      full_name: profileData.full_name,
      location: { lat: 15.3000, lon: 74.1250 }, // Example mock location for update
      skills: profileData.skills.split(',').map(s => s.trim()),
    };

    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update profile.');
      }
      
      const newUserData = await response.json();
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading profile...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;

  // Render nothing if user is null after loading and no error.
  if (!user) return null;

  const userSkills = profileData.skills.split(',').map(s => s.trim());
  const workHistory = [
    { title: "Football Coach", date: "Completed 21 days ago" },
    { title: "Event Photographer for a Birthday Party", date: "Completed about 1 month ago" },
  ]; // Mock data based on screenshot

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-center mb-6">
              <img src={profileData.avatar_url} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" />
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">{profileData.full_name}</h2>
              <div className="flex items-center justify-center text-gray-400 mt-2">
                <MapPin size={16} className="mr-1" />
                <span>{profileData.location || "Pillar, Goa"}</span>
              </div>
            </div>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="flex items-center"><Briefcase size={16} className="mr-2" />2 Jobs Completed</p>
              <p className="flex items-center"><CalendarDays size={16} className="mr-2" />Member since July 2025</p>
            </div>
            
            <div className="border-t border-gray-700 my-6"></div>
            
            <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userSkills.filter(s => s).map((skill, index) => (
                <span key={index} className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>

          {/* Right Column: About and Work History */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">About {profileData.full_name}</h3>
                <button onClick={() => setEditMode(!editMode)} className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Edit size={20} />
                </button>
              </div>
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input type="text" name="full_name" value={profileData.full_name} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input type="text" name="location" value={profileData.location} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">About</label>
                    <textarea name="about" value={profileData.about} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" rows="3"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Skills (comma-separated)</label>
                    <input type="text" name="skills" value={profileData.skills} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" />
                  </div>
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>Save</button>
                    <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Cancel</button>
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </form>
              ) : (
                <p className="text-gray-400">{profileData.about}</p>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Work History</h3>
              <p className="text-gray-400 mb-4">A showcase of successfully completed jobs.</p>
              <ul className="space-y-4">
                {workHistory.map((job, index) => (
                  <li key={index} className="flex items-center space-x-3 text-gray-400">
                    <Briefcase size={18} className="text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white">{job.title}</p>
                      <p className="text-sm">{job.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
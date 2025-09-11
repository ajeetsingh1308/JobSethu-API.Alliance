import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { MapPin, Briefcase, CalendarDays, Edit, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '', location: '', about: '', skills: '', avatar_url: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch profile data.');
        const data = await response.json();
        const initialData = {
          full_name: data.full_name || '',
          location: data.location || '',
          about: data.about || '',
          skills: data.skills ? data.skills.join(', ') : '',
          avatar_url: data.avatar_url || `https://ui-avatars.com/api/?name=${data.full_name || 'User'}&background=3b82f6&color=fff`,
        };
        setUser(data);
        setProfileData(initialData);
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
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const token = localStorage.getItem('token');
    const updatedData = { ...profileData, skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean), };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Failed to update profile.'); }
      const newUserData = await response.json();
      setUser(newUserData);
      setProfileData({ ...profileData, full_name: newUserData.full_name || '', location: newUserData.location || '', about: newUserData.about || '', skills: newUserData.skills ? newUserData.skills.join(', ') : '', });
      setEditMode(false);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (loading && !user) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading profile...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  if (!user) return null;

  const userSkills = profileData.skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col self-start">
            <div className="flex-grow">
              <div className="flex justify-center mb-6"><img src={profileData.avatar_url} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700" /></div>
              <div className="text-center mb-6"><h2 className="text-2xl font-bold text-white">{profileData.full_name}</h2><div className="flex items-center justify-center text-gray-400 mt-2"><MapPin size={16} className="mr-1" /><span>{profileData.location || "Location not set"}</span></div></div>
              <div className="border-t border-gray-700 my-6"></div>
              <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userSkills.length > 0 ? userSkills.map((skill, index) => (<span key={index} className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">{skill}</span>)) : <p className="text-gray-500 text-sm">No skills added yet.</p>}
              </div>
            </div>
            <div className="mt-6 border-t border-gray-700 pt-4">
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-red-400 hover:bg-red-900/20 py-2 rounded-lg transition-colors"><LogOut size={16} /><span>Logout</span></button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">About {profileData.full_name}</h3>
                {!editMode && <button onClick={() => setEditMode(true)} className="text-gray-400 hover:text-blue-500 transition-colors"><Edit size={20} /></button>}
              </div>
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="block text-sm font-medium">Full Name</label><input type="text" name="full_name" value={profileData.full_name} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" /></div>
                  <div><label className="block text-sm font-medium">Location</label><input type="text" name="location" value={profileData.location} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" /></div>
                  <div><label className="block text-sm font-medium">About</label><textarea name="about" value={profileData.about} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" rows="3"></textarea></div>
                  <div><label className="block text-sm font-medium">Skills (comma-separated)</label><input type="text" name="skills" value={profileData.skills} onChange={handleEditChange} className="w-full p-2 bg-gray-700 rounded" /></div>
                  <div className="flex space-x-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>Save</button><button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Cancel</button></div>
                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </form>
              ) : (<p className="text-gray-400">{profileData.about || 'No information provided. Click the edit icon to add details.'}</p>)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
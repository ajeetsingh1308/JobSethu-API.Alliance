// src/pages/MessagesPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { SendHorizonal, Sparkles } from 'lucide-react';

const MessagesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch message history and user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/jobs/${id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch messages.');
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [id, navigate]);
  
  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    const senderId = JSON.parse(localStorage.getItem('user')).id;

    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage }),
      });
      if (!response.ok) throw new Error('Failed to send message.');
      const sentMessage = await response.json();
      setMessages((prev) => [...prev, { ...sentMessage, sender_id: senderId }]);
      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Mock AI suggestion for replies
  const handleSuggestReply = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          job_title: "Help with garden weeding", // Mock job title
          message_history: messages,
        }),
      });
      if (!response.ok) throw new Error('Failed to get suggestions.');
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading messages...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-80px)]">
        <h1 className="text-3xl font-bold text-white mb-4">Chat for Job: {id}</h1>
        
        {/* Message container */}
        <div className="flex-1 bg-gray-800 rounded-xl p-4 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-sm ${msg.sender_id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* AI suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((sugg, index) => (
              <button
                key={index}
                onClick={() => setNewMessage(sugg)}
                className="bg-gray-700 text-sm px-3 py-1 rounded-full text-gray-300 hover:bg-gray-600 transition-colors"
              >
                {sugg}
              </button>
            ))}
          </div>
        )}
        
        {/* Message input and buttons */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSuggestReply}
            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            title="Get AI Reply Suggestions"
          >
            <Sparkles size={20} className="text-yellow-400" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 rounded-full bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
          >
            <SendHorizonal size={20} className="text-white" />
          </button>
        </form>
      </main>
    </div>
  );
};

export default MessagesPage;
// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import AuthPages from './pages/AuthPages';
import CreateJobPage from './pages/CreateJobPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import MessagesPage from './pages/MessagesPage';
import BottomNavBar from './components/BottomNavBar';
import Footer from './components/Footer'; // Import the new Footer component

function App() {
  return (
    <Router>
      <div className="relative min-h-screen flex flex-col">
        {/* Main content area */}
        <div className="flex-grow md:pb-0 pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/jobs/new" element={<CreateJobPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs/:id/pay" element={<PaymentPage />} />
            <Route path="/jobs/:id/chat" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<AuthPages />} />
            <Route path="/signup" element={<AuthPages />} />
          </Routes>
        </div>
        
        {/* Bottom Nav for mobile and Footer for all screens */}
        <BottomNavBar />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
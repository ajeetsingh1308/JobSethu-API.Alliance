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

// Placeholder components for the pages we will build next
const OnboardingPage = () => <div>Onboarding Page</div>;

function App() {
  return (
    <Router>
      {/* Use a simple container for the whole app and add a wrapper for responsiveness */}
      <div className="relative min-h-screen">
        <div className="md:pb-0 pb-16">
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
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </div>
        <BottomNavBar />
      </div>
    </Router>
  );
}

export default App;
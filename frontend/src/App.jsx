// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import AuthPages from './pages/AuthPages';
import CreateJobPage from './pages/CreateJobPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage'; // Import the new page

// Placeholder components for the pages we will build next
const PaymentPage = () => <div>Payment Page</div>;
const OnboardingPage = () => <div>Onboarding Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/jobs/new" element={<CreateJobPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs/:id/pay" element={<PaymentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<AuthPages />} />
        <Route path="/signup" element={<AuthPages />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
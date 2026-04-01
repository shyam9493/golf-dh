import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage.jsx';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage.jsx';
import CharitiesPage from './pages/CharitiesPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/charities" element={<CharitiesPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
      <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

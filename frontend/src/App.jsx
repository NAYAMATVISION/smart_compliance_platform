import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import BusinessProfile from './components/B_profile';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import UserManagement from './components/UserManagement';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/business-profile" element={<AppLayout><BusinessProfile /></AppLayout>} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/copilot" element={<AppLayout><AIAssistant /></AppLayout>} />
        <Route path="/users" element={<AppLayout><UserManagement /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

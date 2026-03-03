import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import IdeaDetail from './pages/IdeaDetail';
import DeletedIdeas from './pages/DeletedIdeas';
import Login from './pages/Login';
import Register from './pages/Register';
import BatchDetail from './pages/BatchDetail';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import PromptSettings from './pages/PromptSettings';
import IdeaPlatforms from './pages/IdeaPlatforms';

// Protected route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

// Admin only route
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  return children;
}

// Admin and Marketing route
function CreatorRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (user.role !== 'admin' && user.role !== 'marketing') return <Navigate to="/" />;

  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans w-full overflow-x-hidden">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/generate" element={<CreatorRoute><GenerateIdea /></CreatorRoute>} />
          <Route path="/idea/:id" element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>} />
          <Route path="/batch/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
          <Route path="/idea/:id/platforms" element={<ProtectedRoute><IdeaPlatforms /></ProtectedRoute>} />
          <Route path="/deleted" element={<CreatorRoute><DeletedIdeas /></CreatorRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/prompt" element={<CreatorRoute><PromptSettings /></CreatorRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

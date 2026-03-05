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
import AdminSettings from './pages/AdminSettings';

// Protected route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const isValidToken = token && token !== 'null' && token !== 'undefined';
  return isValidToken ? children : <Navigate to="/login" />;
}

// Admin only route
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const isValidToken = token && token !== 'null' && token !== 'undefined';

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  if (!isValidToken) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  return children;
}

// Admin and Marketing route
function CreatorRoute({ children }) {
  const token = localStorage.getItem('token');
  const isValidToken = token && token !== 'null' && token !== 'undefined';

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  if (!isValidToken) return <Navigate to="/login" />;
  if (user.role !== 'admin' && user.role !== 'marketing') return <Navigate to="/" />;

  return children;
}

import axios from 'axios';

function App() {
  useEffect(() => {
    // Global axios interceptor for 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('[AUTH] 401 Unauthorized detected. Clearing session...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Smooth redirect to login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

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
          <Route path="/deleted" element={<CreatorRoute><DeletedIdeas /></CreatorRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/prompt" element={<CreatorRoute><PromptSettings /></CreatorRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

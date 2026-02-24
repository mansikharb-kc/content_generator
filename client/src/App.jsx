import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import IdeaDetail from './pages/IdeaDetail';
import DeletedIdeas from './pages/DeletedIdeas';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route component
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
    setLoading(false);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return isAuth ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GenerateIdea /></ProtectedRoute>} />
          <Route path="/idea/:id" element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>} />
          <Route path="/deleted" element={<ProtectedRoute><DeletedIdeas /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


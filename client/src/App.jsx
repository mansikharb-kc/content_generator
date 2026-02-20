import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import IdeaDetail from './pages/IdeaDetail';
import DeletedIdeas from './pages/DeletedIdeas';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-text font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/generate" element={
              <PrivateRoute>
                <GenerateIdea />
              </PrivateRoute>
            } />
            <Route path="/idea/:id" element={
              <PrivateRoute>
                <IdeaDetail />
              </PrivateRoute>
            } />
            <Route path="/deleted" element={
              <PrivateRoute>
                <DeletedIdeas />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

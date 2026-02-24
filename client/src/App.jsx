import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import IdeaDetail from './pages/IdeaDetail';
import DeletedIdeas from './pages/DeletedIdeas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generate" element={<GenerateIdea />} />
          <Route path="/idea/:id" element={<IdeaDetail />} />
          <Route path="/deleted" element={<DeletedIdeas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


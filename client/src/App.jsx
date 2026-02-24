import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import GenerateIdea from './pages/GenerateIdea';
import IdeaDetail from './pages/IdeaDetail';
import DeletedIdeas from './pages/DeletedIdeas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans">
        <Routes>
          <Route path="/login/*" element={
            <div className="flex items-center justify-center min-h-screen">
              <SignIn routing="path" path="/login" signUpUrl="/register" />
            </div>
          } />
          <Route path="/register/*" element={
            <div className="flex items-center justify-center min-h-screen">
              <SignUp routing="path" path="/register" signInUrl="/login" />
            </div>
          } />
          <Route path="/" element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
          <Route path="/generate" element={
            <>
              <SignedIn>
                <GenerateIdea />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
          <Route path="/idea/:id" element={
            <>
              <SignedIn>
                <IdeaDetail />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
          <Route path="/deleted" element={
            <>
              <SignedIn>
                <DeletedIdeas />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


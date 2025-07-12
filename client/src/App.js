import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AskQuestion from './components/AskQuestion';
import QuestionDetail from './components/QuestionDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/ask" element={<PrivateRoute><AskQuestion /></PrivateRoute>} />
              <Route path="/questions/:id" element={<QuestionDetail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Private route component
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Public route component (redirect to home if already logged in)
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

export default App;

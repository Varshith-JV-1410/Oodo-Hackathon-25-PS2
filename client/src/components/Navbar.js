import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          StackIt
        </Link>
        
        <div className="navbar-nav">
          {user ? (
            <>
              <span className="nav-link">Welcome, {user.name}!</span>
              <Link to="/ask" className="btn btn-primary">
                Ask Question
              </Link>
              <button onClick={logout} className="btn btn-outline-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

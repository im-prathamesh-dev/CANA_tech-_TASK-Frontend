import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      staff: 'badge-warning',
      viewer: 'badge-success',
    };
    return badges[role] || '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo">
              CRM System
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">
                Dashboard
              </Link>
              <Link to="/clients" className="nav-link">
                Clients
              </Link>
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <Link to="/clients/new" className="nav-link">
                  Add Client
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/users" className="nav-link">
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className={`badge ${getRoleBadge(user?.role)}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/navbar.css';
import icon from '../../assets/icon.png';

function Navbar() { 
  const location = useLocation();

  // Paths
  const isDashboard = location.pathname === '/';
  const isOrderline = location.pathname.includes('orderline') || location.pathname.includes('order');

  const handleSearch = (e) => {
    const value = e.target.value;
    window.dispatchEvent(new CustomEvent('dashboard-search', { detail: value }));
  };

  // ✅ Hide searchbar entirely if it's an OrderLine / Order page
  if (isOrderline) {
    return (
      <div className="navbar-container">
        <div className="icon-wrapper">
          <img src={icon} alt="Profile Icon" className="profile-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="navbar-container">
      {/* Profile Icon */}
      <div className="icon-wrapper">
        <img src={icon} alt="Profile Icon" className="profile-icon" />
      </div>

      {/* Dashboard Search */}
      {isDashboard && (
        <div className="search-group">
          <input
            className="search-input"
            type="text"
            placeholder="Filter..."
            onChange={handleSearch}
          />
          <div className="dropdown-button">
            <i className="fa-solid fa-angle-down"></i>
          </div>
        </div>
      )}

      {/* Other Pages Search */}
      {!isDashboard && !isOrderline && (
        <div className="search-group1">
          <div className="dropdown-button1">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <input
            className="search-input1"
            type="text"
            placeholder="Search"
          />
        </div>
      )}
    </div>
  );
}

export default Navbar;

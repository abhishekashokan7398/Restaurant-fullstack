import React from 'react';
import '../../styles/sidebar.css';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdLocalShipping } from 'react-icons/md';
import { FaBook } from 'react-icons/fa';
import { BiBarChart } from 'react-icons/bi';
 import { FaChair } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="side">
      <div style={{ marginTop: '20px', marginLeft: '12px' }}>
        
        <NavLink to="/" className={({ isActive }) => isActive ? 'side-icon active' : 'side-icon'}>
          <MdDashboard />
        </NavLink>

        <NavLink to="/tables" className={({ isActive }) => isActive ? 'side-icon active' : 'side-icon'}>
           <FaChair />
        </NavLink>

        <NavLink to="/order" className={({ isActive }) => isActive ? 'side-icon active' : 'side-icon'}>
          <FaBook />
        </NavLink>

        <NavLink to="/products" className={({ isActive }) => isActive ? 'side-icon active' : 'side-icon'}>
          <BiBarChart />
        </NavLink>

        <div className="side-icon-bottom"></div>
      </div>
    </div>
  );
}

export default Sidebar;

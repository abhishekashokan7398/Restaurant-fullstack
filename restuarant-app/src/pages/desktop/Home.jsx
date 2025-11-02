import React, { useState } from 'react';
import Navbar from '../../components/desktop/Navbar';
import Sidebar from '../../components/desktop/Sidebar';
import "../../styles/home.css";
import { Outlet } from 'react-router-dom';

function Home() {
  // 🔹 Define state to hold search/filter text
  const [filterText, setFilterText] = useState('');

  return (
    <div className="container" style={{ width: '100%', minHeight: '100vh' ,backgroundColor: '#F0F5F3' }}>
      
      {/* Navbar (Filter input is inside this) */}
      <div style={{ paddingTop: '20px' }}>
         <Navbar Dashboard={true} onFilterChange={setFilterText} /> 
      </div>

      {/* Sidebar */}
      <div style={{ marginTop: '10px', marginLeft: '40px' }}>
        <Sidebar />
      </div>

      {/* Main Body */}
      <div style={{marginLeft:'8%'}}>
       
        <Outlet context={{ filterText }} />
      </div>
    </div>
  );
}

export default Home;

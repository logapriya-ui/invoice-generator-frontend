import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import Auth from './components/Auth.jsx';
import  Dashboard from './components/Dashboard.jsx';
import InvoiceGenerator from './components/InvoiceGenerator.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Fix: Added the landing page route */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        
        {/* Auth Routes */}
        <Route path="/login" element={<Auth isLogin={true} />} />
        <Route path="/signup" element={<Auth isLogin={false} />} />
        
        {/* Tool Route */}
        <Route path="/generator" element={<InvoiceGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { SecurityPage } from './pages/Security/SecurityPage';
import MiddlewarePage from './pages/Middleware';
import { ServicesPage } from './pages/Services/ServicesPage';
import { BedrifterPage } from './pages/Bedrifter/BedrifterPage';
import { BrukereePage } from './pages/Brukere/BrukereePage';
import { SystemPage } from './pages/System/SystemPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/middleware" element={<MiddlewarePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/bedrifter" element={<BedrifterPage />} />
            <Route path="/brukere" element={<BrukereePage />} />
            <Route path="/system" element={<SystemPage />} />
          </Routes>
        </AdminLayout>
      </div>
    </Router>
  );
}

export default App; 
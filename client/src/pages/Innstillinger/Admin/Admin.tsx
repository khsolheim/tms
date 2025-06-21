import React from 'react';
import Rolletilganger from './Rolletilganger';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003366] mb-8">Admin-innstillinger</h1>
        <Rolletilganger />
      </div>
    </div>
  );
};

export default Admin; 
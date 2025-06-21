import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import ElevRegistrer from '../ElevRegistrer';

const NyElev: React.FC = () => {
  const { bruker } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/elever');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003366] mb-8">Registrer ny elev</h1>
        <ElevRegistrer 
          bedriftId={bruker?.bedrift?.id} 
          onClose={handleClose} 
        />
      </div>
    </div>
  );
};

export default NyElev; 
import React from 'react';

interface BedriftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder komponent inntil den riktige blir implementert  
const BedriftModal: React.FC<BedriftModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white px-2 py-1 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Bedrift Modal</h3>
        <p className="text-gray-600 mb-4">Modal innhold kommer her</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
        >
          Lukk
        </button>
      </div>
    </div>
  );
};

export default BedriftModal; 
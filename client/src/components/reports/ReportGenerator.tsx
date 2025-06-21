import React from 'react';

// Placeholder komponent inntil den riktige blir implementert
const ReportGenerator: React.FC = () => {
  return (
    <div className="bg-white px-2 py-1 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Rapport Generator</h3>
      <div className="cards-spacing-vertical">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rapport Type
          </label>
          <select className="w-full border border-gray-300 rounded-md px-2 py-1">
            <option>Velg rapport type</option>
            <option>Månedlig oversikt</option>
            <option>Årlig sammendrag</option>
          </select>
        </div>
        <button onClick={() => console.log('Button clicked')} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
          Generer Rapport
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator; 
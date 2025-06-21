import React from 'react';

// Placeholder komponent inntil den riktige blir implementert
const AdvancedKontraktForm: React.FC = () => {
  return (
    <div className="bg-white px-2 py-1 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Avansert Kontrakt Form</h3>
      <div className="cards-spacing-vertical">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beskrivelse
          </label>
          <textarea 
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            rows={4}
            placeholder="Skriv inn kontraktbeskrivelse..."
          />
        </div>
        <button onClick={() => console.log('Lagre endringer')} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
          Lagre
        </button>
      </div>
    </div>
  );
};

export default AdvancedKontraktForm; 
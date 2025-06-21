import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OpprettKunde() {
  const navigate = useNavigate();
  const [navn, setNavn] = useState('');
  const [epost, setEpost] = useState('');
  const [telefon, setTelefon] = useState('');

  const handleLagre = () => {
    // Her kan du legge til lagre-logikk
    alert('Kunde opprettet!');
    navigate('/kunde/oversikt');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Opprett ny kunde</h1>
      <div className="mb-4">
        <label className="block mb-1">Navn</label>
        <input value={navn} onChange={e => setNavn(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="mb-4">
        <label className="block mb-1">E-post</label>
        <input value={epost} onChange={e => setEpost(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Telefon</label>
        <input value={telefon} onChange={e => setTelefon(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <button onClick={handleLagre} className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800">Lagre kunde</button>
    </div>
  );
} 
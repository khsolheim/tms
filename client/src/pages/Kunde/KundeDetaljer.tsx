import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TABS = [
  { key: 'kontakt', label: 'Kontaktinformasjon' },
  { key: 'historikk', label: 'Historikk' },
  { key: 'salg', label: 'Salgsmuligheter' },
  { key: 'kontrakter', label: 'Kontrakter/Avtaler' },
  { key: 'support', label: 'Support-saker' },
  { key: 'segmentering', label: 'Segmentering/Lister' },
  { key: 'rapporter', label: 'Rapporter' },
];

export default function KundeDetaljer() {
  const { id } = useParams(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [tab, setTab] = useState('kontakt');
  const [navn, setNavn] = useState('Ola Nordmann');
  const [epost, setEpost] = useState('ola@eksempel.no');
  const [telefon, setTelefon] = useState('12345678');

  const handleSlett = () => {
    alert('Kunde slettet!');
    navigate('/kunde/oversikt');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kundedetaljer</h1>
      <div className="flex gap-4 border-b border-blue-200 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-700 text-blue-700' : 'border-transparent text-blue-400 hover:text-blue-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-6">
        {tab === 'kontakt' && (
          <div>
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
            <button onClick={() => console.log('Lagre endringer')} className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-[#003366]/90">Lagre endringer</button>
          </div>
        )}
        {tab === 'historikk' && <div>Her vises historikk (møter, korrespondanse)...</div>}
        {tab === 'salg' && <div>Her vises salgsmuligheter...</div>}
        {tab === 'kontrakter' && <div>Her vises kontrakter/avtaler...</div>}
        {tab === 'support' && <div>Her vises support-saker...</div>}
        {tab === 'segmentering' && <div>Her vises segmentering/lister...</div>}
        {tab === 'rapporter' && <div>Her vises rapporter (salgsanalyse, kundetilfredshet)...</div>}
      </div>
      <button onClick={handleSlett} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Slett kunde</button>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import kundeService, { Kunde, KundeListeResponse } from '../../services/kunde.service';

export default function KundeOversikt() {
  const [sok, setSok] = useState('');
  const [kundeData, setKundeData] = useState<KundeListeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hentKunder = async () => {
      try {
        const data = await kundeService.hentKunder({ sok: sok || undefined });
        setKundeData(data);
      } catch (error) {
        console.error('Feil ved henting av kunder:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      hentKunder();
    }, 300); // Debounce søk

    return () => clearTimeout(timeoutId);
  }, [sok]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kunder = kundeData?.kunder || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kundeoversikt</h1>
      <div className="flex gap-4 mb-4">
        <input
          value={sok}
          onChange={e => setSok(e.target.value)}
          placeholder="Søk etter kunde..."
          className="border rounded px-2 py-1 flex-1"
        />
        <Link to="/kunde/opprett" className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 flex items-center gap-2">
          <FaUserPlus /> Opprett ny kunde
        </Link>
      </div>
      
      {kundeData && (
        <div className="mb-4 text-sm text-gray-600">
          Viser {kunder.length} av {kundeData.totalt} kunder
        </div>
      )}

      <table className="w-full bg-white border rounded text-left">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 border-b">Navn</th>
            <th className="p-2 border-b">E-post</th>
            <th className="p-2 border-b">Telefon</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Handling</th>
          </tr>
        </thead>
        <tbody>
          {kunder.map((kunde) => (
            <tr key={kunde.id} className="hover:bg-blue-50">
              <td className="p-2 border-b">{kunde.navn}</td>
              <td className="p-2 border-b">{kunde.epost}</td>
              <td className="p-2 border-b">{kunde.telefon}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  kunde.status === 'aktiv' 
                    ? 'bg-green-100 text-green-800' 
                    : kunde.status === 'inaktiv'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {kunde.status}
                </span>
              </td>
              <td className="p-2 border-b">
                <Link to={`/kunde/${kunde.id}`} className="text-blue-700 underline hover:text-blue-900">
                  Endre
                </Link>
              </td>
            </tr>
          ))}
          {kunder.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-center text-blue-400">
                {sok ? 'Ingen kunder funnet for søket' : 'Ingen kunder registrert'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 
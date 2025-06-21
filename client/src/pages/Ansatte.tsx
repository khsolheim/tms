import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { ansatteService, type Ansatt } from '../services/ansatte.service';

export default function Ansatte() {
  const [ansatte, setAnsatte] = useState<Ansatt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sok, setSok] = useState('');

  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const response = await ansatteService.hentAnsatte({ søk: sok || undefined });
        setAnsatte(response.ansatte);
        setError(null);
      } catch (err) {
        console.error('Feil ved henting av ansatte:', err);
        setError('Kunne ikke hente ansatte');
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, [sok]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Laster ansatte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ansatte</h1>
      <div className="flex gap-4 mb-4">
        <input
          value={sok}
          onChange={e => setSok(e.target.value)}
          placeholder="Søk etter ansatt..."
          className="border rounded px-2 py-1 flex-1 bg-white text-gray-900"
        />
        <Link to="/ansatte/opprett" className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 flex items-center gap-2">
          <FaUserPlus /> Opprett ny ansatt
        </Link>
      </div>
      <table className="w-full bg-white border rounded text-left">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 border-b">Navn</th>
            <th className="p-2 border-b">E-post</th>
            <th className="p-2 border-b">Bedrift</th>
            <th className="p-2 border-b">Rolle</th>
            <th className="p-2 border-b">Hovedbruker</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Handling</th>
          </tr>
        </thead>
        <tbody>
          {ansatte.map((a) => (
            <tr key={a.id} className="hover:bg-blue-50">
              <td className="p-2 border-b">{a.navn}</td>
              <td className="p-2 border-b">{a.epost}</td>
              <td className="p-2 border-b">{a.bedrift}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  a.rolle === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  a.rolle === 'HOVEDBRUKER' ? 'bg-blue-100 text-blue-800' :
                  a.rolle === 'INSTRUKTØR' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {a.rolle}
                </span>
              </td>
              <td className="p-2 border-b">
                {a.hovedbruker ? (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Ja</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Nei</span>
                )}
              </td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  a.status === 'aktiv' ? 'bg-green-100 text-green-800' :
                  a.status === 'inaktiv' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {a.status === 'aktiv' ? 'Aktiv' : a.status === 'inaktiv' ? 'Inaktiv' : 'Pause'}
                </span>
              </td>
              <td className="p-2 border-b">
                <Link to={`/ansatte/${a.id}`} className="text-blue-700 underline hover:text-blue-900">Endre</Link>
              </td>
            </tr>
          ))}
          {ansatte.length === 0 && (
            <tr><td colSpan={7} className="p-2 text-center text-blue-400">Ingen ansatte funnet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 
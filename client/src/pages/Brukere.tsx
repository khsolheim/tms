import React, { useState, useEffect } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import api from '../lib/api';

interface Bruker {
  id: number;
  navn: string;
  epost: string;
  rolle: string;
  bedrift: {
    id: number;
    navn: string;
  } | null;
  tilganger: string[];
}

export default function Brukere() {
  const [sok, setSok] = useState('');
  const [brukere, setBrukere] = useState<Bruker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);

  useEffect(() => {
    const hentBrukere = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/brukere');
        setBrukere(Array.isArray(res.data) ? res.data : []);
      } catch (error: any) {
        console.error('Feil ved henting av brukere:', error);
        
        let errorMessage = 'Kunne ikke hente brukere';
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            errorMessage = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
          } else if (status === 403) {
            errorMessage = 'Du har ikke tilgang til å se brukere. Kun administratorer kan se alle brukere.';
          } else if (data?.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `Server feil (${status}): ${errorMessage}`;
          }
        } else if (error.request) {
          errorMessage = 'Kunne ikke kontakte serveren. Sjekk internetttilkoblingen.';
        }
        
        setError(errorMessage);
        setBrukere([]);
      } finally {
        setLoading(false);
      }
    };

    hentBrukere();
  }, []);

  const handleProveIgjen = () => {
    const hentBrukere = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/brukere');
        setBrukere(Array.isArray(res.data) ? res.data : []);
      } catch (error: any) {
        console.error('Feil ved henting av brukere:', error);
        
        let errorMessage = 'Kunne ikke hente brukere';
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            errorMessage = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
          } else if (status === 403) {
            errorMessage = 'Du har ikke tilgang til å se brukere. Kun administratorer kan se alle brukere.';
          } else if (data?.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `Server feil (${status}): ${errorMessage}`;
          }
        } else if (error.request) {
          errorMessage = 'Kunne ikke kontakte serveren. Sjekk internetttilkoblingen.';
        }
        
        setError(errorMessage);
        setBrukere([]);
      } finally {
        setLoading(false);
      }
    };

    hentBrukere();
  };

  // Sikre at brukere er en array før filtering
  const filtrert = Array.isArray(brukere) ? brukere.filter(b =>
    !sok || 
    b.navn.toLowerCase().includes(sok.toLowerCase()) || 
    b.epost.toLowerCase().includes(sok.toLowerCase()) ||
    b.bedrift?.navn.toLowerCase().includes(sok.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Brukere</h1>
        <div className="text-center py-1">Laster brukere...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Brukere</h1>
        <div className="text-center py-1">
          <div className="text-red-600 mb-4">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</div>
          <button 
            onClick={handleProveIgjen}
            className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-[#003366]/90"
          >
            Prøv på nytt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Brukere</h1>
      <div className="flex gap-4 mb-4">
        <input
          value={sok}
          onChange={e => setSok(e.target.value)}
          placeholder="Søk etter bruker..."
          className="border rounded px-2 py-1 flex-1 bg-white text-gray-900"
        />
        <button 
          onClick={() => alert('Opprett ny bruker-funksjonalitet kommer snart!')} 
          className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-[#003366]/90 flex items-center gap-2"
        >
          <FaUserPlus /> Opprett ny bruker
        </button>
      </div>
      <table className="w-full bg-white border rounded text-left">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 border-b">Navn</th>
            <th className="p-2 border-b">E-post</th>
            <th className="p-2 border-b">Rolle</th>
            <th className="p-2 border-b">Bedrift</th>
            <th className="p-2 border-b">Tilganger</th>
            <th className="p-2 border-b">Handling</th>
          </tr>
        </thead>
        <tbody>
          {filtrert.map((b) => (
            <tr key={b.id} className="hover:bg-blue-50">
              <td className="p-2 border-b">{b.navn}</td>
              <td className="p-2 border-b">{b.epost}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 text-xs rounded ${
                  b.rolle === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  b.rolle === 'HOVEDBRUKER' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {b.rolle === 'ADMIN' ? 'Administrator' :
                   b.rolle === 'HOVEDBRUKER' ? 'Hovedbruker' : 'Trafikklærer'}
                </span>
              </td>
              <td className="p-2 border-b">{b.bedrift?.navn || '-'}</td>
              <td className="p-2 border-b">
                <div className="flex flex-wrap gap-1">
                  {b.tilganger.map((tilgang, idx) => (
                    <span key={idx} className="px-1 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {tilgang}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-2 border-b">
                <button 
                  onClick={() => alert(`Endre bruker ${b.navn} - funksjonalitet kommer snart!`)} 
                  className="text-blue-700 underline hover:text-blue-900 mr-2"
                >
                  Endre
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(`Er du sikker på at du vil slette brukeren ${b.navn}?`)) {
                      alert('Slett bruker-funksjonalitet kommer snart!');
                    }
                  }} 
                  className="text-red-600 underline hover:text-red-800"
                >
                  Slett
                </button>
              </td>
            </tr>
          ))}
          {filtrert.length === 0 && (
            <tr><td colSpan={6} className="p-2 text-center text-blue-400">Ingen brukere funnet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 
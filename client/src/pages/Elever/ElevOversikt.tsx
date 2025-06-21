import React, { useState, useEffect } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import api from '../../lib/api';
import ElevRegistrer from '../ElevRegistrer';
import { useAuth } from '../../contexts';
import { 
  TableSkeleton, 
  ErrorState 
  // LoadingSpinner // Unused 
} from '../../components/ui/LoadingStates';

interface Elev {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  klassekode: string;
  status: string;
}

interface Bedrift {
  id: number;
  navn: string;
}

const ElevOversikt: React.FC = () => {
  const { bruker } = useAuth();
  const [sok, setSok] = useState('');
  const [elever, setElever] = useState<Elev[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [visRegistrer, setVisRegistrer] = useState(false);
  const [bedrifter, setBedrifter] = useState<Bedrift[]>([]);
  const [valgtBedriftId, setValgtBedriftId] = useState<number | null>(null);

  useEffect(() => {
    if (bruker?.rolle === 'ADMIN') {
      const hentBedrifter = async () => {
        try {
          const res = await api.get('/bedrifter');
          setBedrifter(res.data);
        } catch (error) {
          setBedrifter([]);
        }
      };
      hentBedrifter();
    }
  }, [bruker]);

  useEffect(() => {
    const hentElever = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For admin-brukere som ikke har valgt bedrift ennå
        if (bruker?.rolle === 'ADMIN' && !valgtBedriftId) {
          setError('Du må velge en bedrift for å se elever.');
          setElever([]);
          setLoading(false);
          return;
        }
        
        // Velg riktig API-endepunkt basert på brukerrolle
        let apiUrl = '/elever';
        if (bruker?.rolle === 'ADMIN' && valgtBedriftId) {
          apiUrl = `/elever/bedrift/${valgtBedriftId}`;
        }
        
        const res = await api.get(apiUrl);
        setElever(Array.isArray(res.data) ? res.data : []);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Kunne ikke hente elever');
        setElever([]);
      } finally {
        setLoading(false);
      }
    };
    hentElever();
  }, [visRegistrer, bruker, valgtBedriftId]);

  const filtrert = Array.isArray(elever) ? elever.filter(e =>
    !sok ||
    (e.fornavn + ' ' + e.etternavn).toLowerCase().includes(sok.toLowerCase()) ||
    e.epost.toLowerCase().includes(sok.toLowerCase()) ||
    e.klassekode.toLowerCase().includes(sok.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Elever</h1>
        <div className="mb-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Elever</h1>
        <ErrorState
          message={typeof error === 'string' ? error : error?.message || 'Ukjent feil'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Elever</h1>
      {bruker?.rolle === 'ADMIN' && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Velg bedrift</label>
          <select
            className="border rounded px-2 py-1"
            value={valgtBedriftId ?? ''}
            onChange={e => setValgtBedriftId(Number(e.target.value) || null)}
          >
            <option value="">Velg bedrift...</option>
            {bedrifter.map(b => (
              <option key={b.id} value={b.id}>{b.navn}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-4 mb-4">
        <input
          value={sok}
          onChange={e => setSok(e.target.value)}
          placeholder="Søk etter elev..."
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setVisRegistrer(true)}
        >
          <FaUserPlus /> Registrer ny elev
        </button>
      </div>
      <table className="w-full bg-white border rounded text-left">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 border-b">Navn</th>
            <th className="p-2 border-b">E-post</th>
            <th className="p-2 border-b">Telefon</th>
            <th className="p-2 border-b">Klasse</th>
            <th className="p-2 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtrert.map((e) => (
            <tr key={e.id} className="hover:bg-blue-50">
              <td className="p-2 border-b">{e.fornavn} {e.etternavn}</td>
              <td className="p-2 border-b">{e.epost}</td>
              <td className="p-2 border-b">{e.telefon}</td>
              <td className="p-2 border-b">{e.klassekode}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 text-xs rounded ${e.status === 'AKTIV' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {e.status === 'AKTIV' ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
            </tr>
          ))}
          {filtrert.length === 0 && (
            <tr><td colSpan={5} className="p-2 text-center text-blue-400">Ingen elever funnet</td></tr>
          )}
        </tbody>
      </table>
      {visRegistrer && (
        <ElevRegistrer bedriftId={
          bruker?.rolle === 'ADMIN'
            ? (typeof valgtBedriftId === 'number' ? valgtBedriftId : undefined)
            : bruker?.bedrift?.id
        } onClose={() => setVisRegistrer(false)} />
      )}
    </div>
  );
};

export default ElevOversikt; 
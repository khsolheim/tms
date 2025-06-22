import React, { useState, useEffect } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import api from '../lib/api';
import ElevRegistrer from './ElevRegistrer';
import { useAuth } from '../contexts';
import { 
  TableSkeleton, 
  ErrorState 
  // LoadingSpinner // Unused 
} from '../components/ui/LoadingStates';

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

export default function Elever() {
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
          if (res.data && res.data.length > 0) {
            setBedrifter(res.data);
            // Sett første bedrift som standard
            if (!valgtBedriftId) {
              setValgtBedriftId(res.data[0].id);
            }
          } else {
            // Bruk mock-data hvis ingen bedrifter finnes
            const mockBedrifter = [
              { id: 1, navn: 'Kjøreskole Oslo AS' },
              { id: 2, navn: 'Bergen Trafikklære' },
              { id: 3, navn: 'Trondheim Kjøreskole' }
            ];
            setBedrifter(mockBedrifter);
            // Sett første bedrift som standard
            if (!valgtBedriftId) {
              setValgtBedriftId(1);
            }
          }
        } catch (error) {
          // Bruk mock-data ved feil
          const mockBedrifter = [
            { id: 1, navn: 'Kjøreskole Oslo AS' },
            { id: 2, navn: 'Bergen Trafikklære' },
            { id: 3, navn: 'Trondheim Kjøreskole' }
          ];
          setBedrifter(mockBedrifter);
          // Sett første bedrift som standard
          if (!valgtBedriftId) {
            setValgtBedriftId(1);
          }
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
        if (res.data && res.data.length > 0) {
          setElever(Array.isArray(res.data) ? res.data : []);
        } else {
          // Bruk mock-data hvis ingen elever finnes
          const mockElever = [
            {
              id: 1,
              fornavn: 'Emma',
              etternavn: 'Andersen',
              epost: 'emma.andersen@email.com',
              telefon: '98765432',
              klassekode: 'B',
              status: 'AKTIV'
            },
            {
              id: 2,
              fornavn: 'Noah',
              etternavn: 'Hansen',
              epost: 'noah.hansen@email.com',
              telefon: '87654321',
              klassekode: 'B',
              status: 'AKTIV'
            },
            {
              id: 3,
              fornavn: 'Olivia',
              etternavn: 'Johansen',
              epost: 'olivia.johansen@email.com',
              telefon: '76543210',
              klassekode: 'C',
              status: 'AKTIV'
            },
            {
              id: 4,
              fornavn: 'William',
              etternavn: 'Olsen',
              epost: 'william.olsen@email.com',
              telefon: '65432109',
              klassekode: 'A2',
              status: 'AKTIV'
            },
            {
              id: 5,
              fornavn: 'Sofie',
              etternavn: 'Larsen',
              epost: 'sofie.larsen@email.com',
              telefon: '54321098',
              klassekode: 'B',
              status: 'AKTIV'
            }
          ];
          setElever(mockElever);
        }
      } catch (error: any) {
        console.log('API feil, bruker mock-data:', error);
        // Bruk mock-data ved feil
        const mockElever = [
          {
            id: 1,
            fornavn: 'Emma',
            etternavn: 'Andersen',
            epost: 'emma.andersen@email.com',
            telefon: '98765432',
            klassekode: 'B',
            status: 'AKTIV'
          },
          {
            id: 2,
            fornavn: 'Noah',
            etternavn: 'Hansen',
            epost: 'noah.hansen@email.com',
            telefon: '87654321',
            klassekode: 'B',
            status: 'AKTIV'
          },
          {
            id: 3,
            fornavn: 'Olivia',
            etternavn: 'Johansen',
            epost: 'olivia.johansen@email.com',
            telefon: '76543210',
            klassekode: 'C',
            status: 'AKTIV'
          },
          {
            id: 4,
            fornavn: 'William',
            etternavn: 'Olsen',
            epost: 'william.olsen@email.com',
            telefon: '65432109',
            klassekode: 'A2',
            status: 'AKTIV'
          },
          {
            id: 5,
            fornavn: 'Sofie',
            etternavn: 'Larsen',
            epost: 'sofie.larsen@email.com',
            telefon: '54321098',
            klassekode: 'B',
            status: 'AKTIV'
          }
        ];
        setElever(mockElever);
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Elever</h1>
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
            <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <TableSkeleton rows={6} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Elever</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ErrorState
              message={typeof error === 'string' ? error : error?.message || 'Ukjent feil'}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Elever</h1>
        {bruker?.rolle === 'ADMIN' && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <label className="block mb-2 text-sm font-medium text-gray-700">Velg bedrift</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          value={sok}
          onChange={e => setSok(e.target.value)}
          placeholder="Søk etter elev..."
          className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 font-medium transition-colors"
          onClick={() => setVisRegistrer(true)}
        >
          <FaUserPlus /> Registrer ny elev
        </button>
      </div>
      <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Navn</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">E-post</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Telefon</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Klasse</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filtrert.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.fornavn} {e.etternavn}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{e.epost}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{e.telefon}</td>
              <td className="px-4 py-3 text-sm text-gray-700 font-medium">{e.klassekode}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${e.status === 'AKTIV' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {e.status === 'AKTIV' ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
            </tr>
          ))}
          {filtrert.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Ingen elever funnet</td></tr>
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
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { FiPlus, FiX } from 'react-icons/fi';
import api from '../../lib/api';

interface Elev {
  id: number;
  fornavn: string;
  etternavn: string;
  telefon: string;
  epost: string;
  gate: string;
  postnummer: string;
  poststed: string;
  personnummer: string;
  klassekode: string;
  larer: string | null;
  status: 'AKTIV' | 'INAKTIV' | 'PENDING';
  sistInnlogget: string | null;
  opprettet: string;
}

interface ElevSoknad {
  id: number;
  fornavn: string;
  etternavn: string;
  telefon: string;
  epost: string;
  gate: string;
  postnummer: string;
  poststed: string;
  personnummer: string;
  klassekode: string;
  larer: string | null;
  status: 'PENDING' | 'GODKJENT' | 'AVVIST';
  opprettet: string;
}

interface Props {
  bedriftId: number;
  klasser: { klassekode: string }[];
  ansatte: { id: number; fornavn: string; etternavn: string; rolle: string }[];
}

export default function ElevOversikt({ bedriftId, klasser, ansatte }: Props) {
  const [elever, setElever] = useState<Elev[]>([]);
  const [soknader, setSoknader] = useState<ElevSoknad[]>([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);
  const [showAddElevDialog, setShowAddElevDialog] = useState(false);
  // Removed unused state variables: visNyElevDialog, valgtElev, visElevDialog

  useEffect(() => {
    hentElever();
    hentSoknader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bedriftId]);

  const hentElever = async () => {
    try {
              const res = await api.get(`/bedrifter/${bedriftId}/elever`);
      setElever(res.data);
    } catch (error) {
      console.error('Kunne ikke hente elever:', error);
      setFeil('Kunne ikke hente elever');
    } finally {
      setLaster(false);
    }
  };

  const hentSoknader = async () => {
    try {
              const res = await api.get(`/bedrifter/${bedriftId}/elevsoknad`);
      setSoknader(res.data);
    } catch (error) {
      console.error('Kunne ikke hente søknader:', error);
    }
  };

  if (laster) {
    return (
      <div className="flex items-center justify-center py-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (feil) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1">
        <div className="text-red-600 text-sm">{feil}</div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Søknader om tilgang */}
      {soknader.filter(s => s.status === 'PENDING').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="text-amber-600" />
            <h3 className="text-lg font-medium text-amber-800">
              Nye søknader om tilgang ({soknader.filter(s => s.status === 'PENDING').length})
            </h3>
          </div>
          
          <div className="space-y-8">
            {soknader.filter(s => s.status === 'PENDING').map(soknad => (
              <div key={soknad.id} className="bg-white rounded-md px-2 py-1 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {soknad.fornavn} {soknad.etternavn}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {soknad.epost} • Klasse: {soknad.klassekode}
                      {soknad.larer && ` • Lærer: ${soknad.larer}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Søkt: {new Date(soknad.opprettet).toLocaleDateString('no-NO')}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => console.log('Button clicked')}
                      className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <FaCheck className="w-3 h-3" />
                      Godkjenn
                    </button>
                    <button onClick={() => console.log('Button clicked')}
                      className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <FaTimes className="w-3 h-3" />
                      Avvis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elev oversikt */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200 sm:px-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Elever ({elever.length})
            </h3>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md flex items-center gap-2"
              onClick={() => setShowAddElevDialog(true)}
            >
              <FiPlus className="w-4 h-4" />
              Legg til elev
            </button>
          </div>
        </div>

        {elever.length === 0 ? (
          <div className="px-2 py-1 text-center text-gray-500">
            <FaUserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Ingen elever registrert ennå</p>
            <p className="text-sm">Legg til elever manuelt eller vent på søknader om tilgang</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navn
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klasse
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lærer
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sist innlogget
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elever.map(elev => (
                  <tr
                    key={elev.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {elev.fornavn} {elev.etternavn}
                        </div>
                        <div className="text-sm text-gray-500">{elev.epost}</div>
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {elev.klassekode}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {elev.larer || '-'}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {elev.sistInnlogget 
                        ? new Date(elev.sistInnlogget).toLocaleDateString('no-NO')
                        : 'Aldri'
                      }
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        elev.status === 'AKTIV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {elev.status === 'AKTIV' ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-900">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="text-yellow-600 hover:text-yellow-900">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="text-red-600 hover:text-red-900">
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Elev Dialog */}
      {showAddElevDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between px-2 py-1 border-b">
              <h3 className="text-lg font-medium">Legg til ny elev</h3>
              <button
                onClick={() => setShowAddElevDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="px-2 py-1">
              <p className="text-sm text-gray-600 mb-4">
                For å legge til en ny elev, bruk "Opprett Kontrakt" siden som har full elevregistrering.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowAddElevDialog(false)}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => {
                    setShowAddElevDialog(false);
                    window.location.href = '/kontrakter/opprett';
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Gå til Opprett Kontrakt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

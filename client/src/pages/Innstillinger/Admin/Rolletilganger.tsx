import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiShield,
  FiSave,
  FiRotateCcw,
  FiUser,
  FiSettings
} from 'react-icons/fi';
import { TILGANGER, STANDARD_ROLLETILGANGER, type Rolle } from '../../../types/roller';
import api from '../../../lib/api';
import { referenceService } from '../../../services/reference.service';

interface Bruker {
  id: string;
  navn: string;
  epost: string;
  rolle: Rolle;
  tilganger: string[];
  sistOppdatert?: string;
  opprettet?: string;
}

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'warning' | 'danger' | 'info';
}

// Hardkodede konstanter erstattet med API-kall

export default function Rolletilganger() {
  const [brukere, setBrukere] = useState<Bruker[]>([]);
  const [valgtBruker, setValgtBruker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Rolle | 'ALL'>('ALL');
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({});
  const [rolleKonfigurasjoner, setRolleKonfigurasjoner] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'info'
  });

  // Hent rolle-konfigurasjoner fra API
  useEffect(() => {
    const hentRolleKonfigurasjoner = async () => {
      try {
        const konfigurasjoner = await referenceService.getRolleKonfigurasjoner();
        setRolleKonfigurasjoner(konfigurasjoner);
      } catch (error) {
        console.error('Feil ved henting av rolle-konfigurasjoner:', error);
        // Beholder fallback-verdier ved feil
      }
    };

    hentRolleKonfigurasjoner();
  }, []);

  useEffect(() => {
    hentBrukere();
  }, []);

  const hentBrukere = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/brukere');
      setBrukere(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Feil ved henting av brukere. Prøv igjen senere.');
      console.error('Feil ved henting av brukere:', error);
    } finally {
      setLoading(false);
    }
  };

  const oppdaterTilganger = async (brukerId: string, tilganger: string[]) => {
    setSaving(brukerId);
    try {
      await api.put(`/brukere/${brukerId}/tilganger`, { tilganger });
      setBrukere(prev => 
        prev.map(b => 
          b.id === brukerId ? { 
            ...b, 
            tilganger,
            sistOppdatert: new Date().toISOString()
          } : b
        )
      );
      
      // Fjern fra pending changes
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[brukerId];
        return newChanges;
      });

      // Vis suksessmelding
      showNotification('Tilganger oppdatert!', 'success');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Feil ved oppdatering av tilganger');
      console.error('Feil ved oppdatering av tilganger:', error);
    } finally {
      setSaving(null);
    }
  };

  const tilbakestillTilStandard = (bruker: Bruker) => {
    const standardTilganger = STANDARD_ROLLETILGANGER[bruker.rolle];
    const rolleObj = rolleKonfigurasjoner.find(r => r.verdi === bruker.rolle);
    const rolleNavn = rolleObj?.navn || bruker.rolle;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Tilbakestill til standard',
      message: `Er du sikker på at du vil tilbakestille tilgangene for ${bruker.navn} til standardinnstillinger for ${rolleNavn}?`,
      type: 'warning',
      onConfirm: () => {
        oppdaterTilganger(bruker.id, standardTilganger);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
      onCancel: () => setConfirmDialog({ ...confirmDialog, isOpen: false })
    });
  };

  const handleTilgangChange = (brukerId: string, tilgangId: string, harTilgang: boolean) => {
    const bruker = brukere.find(b => b.id === brukerId)!;
    const nyeTilganger = harTilgang
      ? bruker.tilganger.filter(t => t !== tilgangId)
      : [...bruker.tilganger, tilgangId];
    
    // Legg til pending changes
    setPendingChanges(prev => ({
      ...prev,
      [brukerId]: nyeTilganger
    }));
  };

  const savePendingChanges = (brukerId: string) => {
    const pendingTilganger = pendingChanges[brukerId];
    if (pendingTilganger) {
      oppdaterTilganger(brukerId, pendingTilganger);
    }
  };

  const discardPendingChanges = (brukerId: string) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[brukerId];
      return newChanges;
    });
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Dette kan erstattes med en toast notification library
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const filteredBrukere = brukere.filter(bruker => {
    const matchesSearch = (bruker.navn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bruker.epost || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || bruker.rolle === selectedRole;
    const matchesModified = !showOnlyModified || pendingChanges[bruker.id];
    
    return matchesSearch && matchesRole && matchesModified;
  });

  const getTilgangerForBruker = (brukerId: string) => {
    return pendingChanges[brukerId] || brukere.find(b => b.id === brukerId)?.tilganger || [];
  };

  const harPendingChanges = (brukerId: string) => {
    return pendingChanges[brukerId] !== undefined;
  };

  if (loading) {
    return (
      <div className="px-2 py-1">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Laster brukere...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 py-1">
        <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1">
          <div className="flex items-center">
            <FiAlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</span>
          </div>
          <button
            onClick={hentBrukere}
            className="mt-3 flex items-center px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administrer Rolletilganger</h1>
        <p className="text-gray-600">
          Administrer brukerroller og tilganger i systemet. Tilganger som endres må lagres eksplisitt.
        </p>
      </div>

      {/* Søk og filter kontroller */}
      <div className="bg-white rounded-lg shadow px-2 py-1 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Søk etter navn eller e-post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Rolle | 'ALL')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Alle roller</option>
              <option value="ADMIN">Administrator</option>
              <option value="HOVEDBRUKER">Hovedbruker</option>
              <option value="TRAFIKKLARER">Trafikklærer</option>
              <option value="ELEV">Elev</option>
            </select>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyModified}
              onChange={(e) => setShowOnlyModified(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Kun endrede</span>
          </label>

          <button
            onClick={hentBrukere}
            className="flex items-center justify-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Oppdater
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 cards-spacing-grid">
        {/* Brukerliste */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="px-2 py-1 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiUsers className="w-5 h-5 mr-2" />
              Brukere ({filteredBrukere.length})
            </h2>
          </div>
          <div className="px-2 py-1">
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {filteredBrukere.map(bruker => (
                <button
                  key={bruker.id}
                  onClick={() => setValgtBruker(bruker.id)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    valgtBruker === bruker.id
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{bruker.navn}</div>
                      <div className="text-sm text-gray-600 truncate">{bruker.epost}</div>
                      <div className="flex items-center mt-1">
                        {(() => {
                          const rolleObj = rolleKonfigurasjoner.find(r => r.verdi === bruker.rolle) || { 
                            navn: bruker.rolle, 
                            farge: 'bg-gray-100 text-gray-800' 
                          };
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rolleObj.farge}`}>
                              {rolleObj.navn}
                            </span>
                          );
                        })()}
                        {harPendingChanges(bruker.id) && (
                          <span className="ml-2 w-2 h-2 bg-orange-400 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredBrukere.length === 0 && (
                <div className="text-center py-1 text-gray-500">
                  <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Ingen brukere funnet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tilgangsoversikt */}
        {valgtBruker && (
          <div className="lg:col-span-3 bg-white rounded-lg shadow">
            {(() => {
              const bruker = brukere.find(b => b.id === valgtBruker)!;
              const currentTilganger = getTilgangerForBruker(valgtBruker);
              const hasPending = harPendingChanges(valgtBruker);
              
              return (
                <>
                  <div className="px-2 py-1 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <FiShield className="w-5 h-5 mr-2" />
                          Tilganger for {bruker.navn}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {rolleKonfigurasjoner.find(r => r.verdi === bruker.rolle)?.navn || bruker.rolle} • {currentTilganger.length} tilganger
                          {hasPending && <span className="text-orange-600 ml-2">• Ulagrede endringer</span>}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {hasPending && (
                          <>
                            <button
                              onClick={() => savePendingChanges(valgtBruker)}
                              disabled={saving === valgtBruker}
                              className="flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              <FiSave className="w-4 h-4 mr-1" />
                              {saving === valgtBruker ? 'Lagrer...' : 'Lagre'}
                            </button>
                            <button
                              onClick={() => discardPendingChanges(valgtBruker)}
                              className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                              <FiX className="w-4 h-4 mr-1" />
                              Forkast
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => tilbakestillTilStandard(bruker)}
                          className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
                        >
                          <FiRotateCcw className="w-4 h-4 mr-1" />
                          Tilbakestill
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-1">
                    {Object.entries(
                      TILGANGER.reduce((acc, tilgang) => ({
                        ...acc,
                        [tilgang.kategori]: [
                          ...(acc[tilgang.kategori] || []),
                          tilgang
                        ]
                      }), {} as Record<string, typeof TILGANGER>)
                    ).map(([kategori, kategoriTilganger]) => (
                      <div key={kategori} className="mb-8 last:mb-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize flex items-center">
                          <FiSettings className="w-4 h-4 mr-2" />
                          {kategori}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({kategoriTilganger.filter(t => currentTilganger.includes(t.id)).length}/{kategoriTilganger.length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
                          {kategoriTilganger.map(tilgang => {
                            const harTilgang = currentTilganger.includes(tilgang.id);
                            
                            return (
                              <div
                                key={tilgang.id}
                                className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                                  harTilgang 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={harTilgang}
                                  onChange={() => handleTilgangChange(valgtBruker, tilgang.id, harTilgang)}
                                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900">{tilgang.navn}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {tilgang.beskrivelse}
                                  </div>
                                </div>
                                {harTilgang && (
                                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {!valgtBruker && (
          <div className="lg:col-span-3 bg-white rounded-lg shadow flex items-center justify-center">
            <div className="text-center py-16">
              <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Velg en bruker</h3>
              <p className="text-gray-600">
                Velg en bruker fra listen til venstre for å administrere deres tilganger
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={confirmDialog.onCancel}
                className="px-2 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-white rounded-md ${
                  confirmDialog.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Bekreft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
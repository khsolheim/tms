import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import referenceService, { SjekkpunktSystem, FørerkortKlasse } from '../../../services/reference.service';
import { log } from '../../../utils/logger';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import NotificationDialog from '../../../components/ui/NotificationDialog';

interface EditingSjekkpunkt {
  id?: number;
  navn: string;
  beskrivelse: string;
  ikon: string;
  aktiv: boolean;
  rekkefølge: number;
}

interface EditingFørerkort {
  id?: number;
  kode: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  minimumsalder: number;
  krav: string[];
  aktiv: boolean;
}

function ReferanseData() {
  const [activeTab, setActiveTab] = useState<'sjekkpunkt' | 'førerkort'>('sjekkpunkt');
  
  // Sjekkpunkt-systemer state
  const [sjekkpunktSystemer, setSjekkpunktSystemer] = useState<SjekkpunktSystem[]>([]);
  const [editingSjekkpunkt, setEditingSjekkpunkt] = useState<EditingSjekkpunkt | null>(null);
  const [loadingSjekkpunkt, setLoadingSjekkpunkt] = useState(true);
  
  // Førerkortklasser state
  const [førerkortKlasser, setFørerkortKlasser] = useState<FørerkortKlasse[]>([]);
  const [editingFørerkort, setEditingFørerkort] = useState<EditingFørerkort | null>(null);
  const [loadingFørerkort, setLoadingFørerkort] = useState(true);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [kategorier, setKategorier] = useState<string[]>(['Motorsykkel', 'Bil', 'Lastebil', 'Buss', 'Spesiell']); // Fallback

  useEffect(() => {
    if (activeTab === 'sjekkpunkt') {
      hentSjekkpunktSystemer();
    } else {
      hentFørerkortKlasser();
    }
    hentKategorier();
  }, [activeTab]);

  const hentKategorier = async () => {
    try {
      const data = await referenceService.getFørerkortKategorier();
      setKategorier(data);
    } catch (error) {
      log.error('Feil ved henting av kategorier:', error);
      // Beholder fallback-verdier ved feil
    }
  };

  const hentSjekkpunktSystemer = async () => {
    setLoadingSjekkpunkt(true);
    try {
      const data = await referenceService.getSjekkpunktSystemer();
      setSjekkpunktSystemer(data);
    } catch (error) {
      log.error('Feil ved henting av sjekkpunkt-systemer:', error);
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Kunne ikke hente sjekkpunkt-systemer',
        type: 'error'
      });
    } finally {
      setLoadingSjekkpunkt(false);
    }
  };

  const hentFørerkortKlasser = async () => {
    setLoadingFørerkort(true);
    try {
      const data = await referenceService.getFørerkortKlasser();
      // Flatten the grouped data
      const flattened = Object.values(data).flat();
      setFørerkortKlasser(flattened);
    } catch (error) {
      log.error('Feil ved henting av førerkortklasser:', error);
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Kunne ikke hente førerkortklasser',
        type: 'error'
      });
    } finally {
      setLoadingFørerkort(false);
    }
  };

  // Sjekkpunkt-systemer CRUD
  const startEditSjekkpunkt = (system?: SjekkpunktSystem) => {
    if (system) {
      setEditingSjekkpunkt({
        id: system.id,
        navn: system.navn,
        beskrivelse: system.beskrivelse,
        ikon: system.ikon,
        aktiv: system.aktiv,
        rekkefølge: system.rekkefølge
      });
    } else {
      setEditingSjekkpunkt({
        navn: '',
        beskrivelse: '',
        ikon: '',
        aktiv: true,
        rekkefølge: sjekkpunktSystemer.length + 1
      });
    }
  };

  const lagreSjekkpunkt = async () => {
    if (!editingSjekkpunkt) return;
    
    try {
      if (editingSjekkpunkt.id) {
        // Oppdater eksisterende
        await referenceService.oppdaterSjekkpunktSystem(editingSjekkpunkt.id, editingSjekkpunkt);
        setNotification({
          isOpen: true,
          title: 'Suksess',
          message: 'Sjekkpunkt-system oppdatert',
          type: 'success'
        });
      } else {
        // Opprett nytt
        await referenceService.opprettSjekkpunktSystem(editingSjekkpunkt);
        setNotification({
          isOpen: true,
          title: 'Suksess',
          message: 'Nytt sjekkpunkt-system opprettet',
          type: 'success'
        });
      }
      
      setEditingSjekkpunkt(null);
      await hentSjekkpunktSystemer();
    } catch (error) {
      log.error('Feil ved lagring av sjekkpunkt-system:', error);
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Kunne ikke lagre sjekkpunkt-system',
        type: 'error'
      });
    }
  };

  const slettSjekkpunkt = async (id: number, navn: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Slett sjekkpunkt-system',
      message: `Er du sikker på at du vil slette "${navn}"? Dette kan påvirke eksisterende sjekkpunkter.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await referenceService.slettSjekkpunktSystem(id);
          setNotification({
            isOpen: true,
            title: 'Suksess',
            message: 'Sjekkpunkt-system slettet',
            type: 'success'
          });
          await hentSjekkpunktSystemer();
        } catch (error) {
          log.error('Feil ved sletting av sjekkpunkt-system:', error);
          setNotification({
            isOpen: true,
            title: 'Feil',
            message: 'Kunne ikke slette sjekkpunkt-system',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <div className="cards-spacing-vertical">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#003366]">Referanse-data administrasjon</h1>
        <div className="text-sm text-gray-600">
          Administrer sjekkpunkt-systemer og førerkortklasser
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sjekkpunkt')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sjekkpunkt'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sjekkpunkt-systemer ({sjekkpunktSystemer.length})
          </button>
          <button
            onClick={() => setActiveTab('førerkort')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'førerkort'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Førerkortklasser ({førerkortKlasser.length})
          </button>
        </nav>
      </div>

      {/* Sjekkpunkt-systemer tab */}
      {activeTab === 'sjekkpunkt' && (
        <div className="cards-spacing-vertical">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sjekkpunkt-systemer</h2>
            <button
              onClick={() => startEditSjekkpunkt()}
              className="inline-flex items-center gap-2 px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              <FaPlus /> Nytt system
            </button>
          </div>

          {loadingSjekkpunkt ? (
            <div className="text-center py-1">
              <div className="text-gray-500">Laster sjekkpunkt-systemer...</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Navn
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beskrivelse
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ikon
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rekkefølge
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
                  {sjekkpunktSystemer.map((system) => (
                    <tr key={system.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{system.navn}</div>
                      </td>
                      <td className="px-2 py-1">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{system.beskrivelse}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{system.ikon}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{system.rekkefølge}</div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          system.aktiv 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {system.aktiv ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditSjekkpunkt(system)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => slettSjekkpunkt(system.id, system.navn)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
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
      )}

      {/* Edit Sjekkpunkt Modal */}
      {editingSjekkpunkt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingSjekkpunkt.id ? 'Rediger sjekkpunkt-system' : 'Nytt sjekkpunkt-system'}
            </h3>
            
            <div className="cards-spacing-vertical">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                <input
                  type="text"
                  value={editingSjekkpunkt.navn}
                  onChange={(e) => setEditingSjekkpunkt({...editingSjekkpunkt, navn: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="F.eks. Bremser"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
                <textarea
                  value={editingSjekkpunkt.beskrivelse}
                  onChange={(e) => setEditingSjekkpunkt({...editingSjekkpunkt, beskrivelse: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  rows={3}
                  placeholder="Beskrivelse av systemet..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
                <input
                  type="text"
                  value={editingSjekkpunkt.ikon}
                  onChange={(e) => setEditingSjekkpunkt({...editingSjekkpunkt, ikon: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="🚗 eller ikon-navn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rekkefølge</label>
                <input
                  type="number"
                  value={editingSjekkpunkt.rekkefølge}
                  onChange={(e) => setEditingSjekkpunkt({...editingSjekkpunkt, rekkefølge: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  min="1"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aktiv-sjekkpunkt"
                  checked={editingSjekkpunkt.aktiv}
                  onChange={(e) => setEditingSjekkpunkt({...editingSjekkpunkt, aktiv: e.target.checked})}
                  className="w-4 h-4 text-[#003366] focus:ring-[#003366] border-gray-300 rounded"
                />
                <label htmlFor="aktiv-sjekkpunkt" className="ml-2 text-sm text-gray-700">
                  Aktiv
                </label>
              </div>
            </div>
            
            <div className="flex justify-end cards-spacing-grid mt-6">
              <button
                onClick={() => setEditingSjekkpunkt(null)}
                className="px-2 py-1 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <FaTimes className="inline mr-2" />
                Avbryt
              </button>
              <button
                onClick={lagreSjekkpunkt}
                disabled={!editingSjekkpunkt.navn.trim() || !editingSjekkpunkt.beskrivelse.trim()}
                className="px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
              >
                <FaSave className="inline mr-2" />
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
}

export default ReferanseData; 
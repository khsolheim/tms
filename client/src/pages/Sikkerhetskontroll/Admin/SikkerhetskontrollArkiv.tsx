import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import SearchAndFilter, { FilterConfig } from '../../../components/ui/SearchAndFilter';
import BulkActions, { useBulkSelection, createCommonBulkActions } from '../../../components/ui/BulkActions';
import DataExport from '../../../components/ui/DataExport';
import Modal, { useModal } from '../../../components/ui/Modal';
import { arkivService, type ArchivedControl } from '../../../services/arkiv.service';
import {
  ArchiveBoxIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';



const SikkerhetskontrollArkiv: React.FC = () => {
  const { actualTheme } = useTheme();
  const [arkiverteKontroller, setArkiverteKontroller] = useState<ArchivedControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
  const [selectedKontroll, setSelectedKontroll] = useState<ArchivedControl | null>(null);

  const {
    selectedIds,
    selectAll,
    deselectAll,
    toggleItem,
    isSelected,
    selectedCount
  } = useBulkSelection(arkiverteKontroller);

  const detailsModal = useModal();

  // Hent arkiverte kontroller
  useEffect(() => {
    const hentData = async () => {
      try {
        setLoading(true);
        const data = await arkivService.hentArkiverteKontroller();
        setArkiverteKontroller(data);
      } catch (error) {
        console.error('Feil ved henting av arkiverte kontroller:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, []);

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      icon: TagIcon,
      options: [
        { id: 'godkjent', label: 'Godkjent', value: 'godkjent', count: 15 },
        { id: 'avvik', label: 'Avvik', value: 'avvik', count: 8 },
        { id: 'kritisk', label: 'Kritisk', value: 'kritisk', count: 3 }
      ]
    },
    {
      id: 'kategori',
      label: 'Kategori',
      type: 'select',
      icon: FolderIcon,
      options: [
        { id: 'verksted', label: 'Verksted', value: 'Verksted' },
        { id: 'kjøretøy', label: 'Kjøretøy', value: 'Kjøretøy' },
        { id: 'revisjon', label: 'Revisjon', value: 'Revisjon' }
      ]
    },
    {
      id: 'bedrift',
      label: 'Bedrift',
      type: 'select',
      icon: BuildingOfficeIcon,
      options: [
        { id: 'oslo', label: 'Oslo Trafikkskole AS', value: 'Oslo Trafikkskole AS' },
        { id: 'bergen', label: 'Bergen Trafikkskole', value: 'Bergen Trafikkskole' }
      ]
    }
  ];

  // Bulk actions
  const bulkActions = createCommonBulkActions({
    onExport: (ids) => console.log('Eksporter:', ids),
    onDelete: (ids) => {
      console.log('Slett permanent:', ids);
      setArkiverteKontroller(prev => prev.filter(k => !ids.includes(k.id)));
      deselectAll();
    }
  });

  // Add restore action
  bulkActions.unshift({
    id: 'restore',
    label: 'Gjenopprett',
    icon: ArrowDownTrayIcon,
    action: (ids) => {
      console.log('Gjenopprett:', ids);
      setArkiverteKontroller(prev => prev.filter(k => !ids.includes(k.id)));
      deselectAll();
    },
    variant: 'success'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'godkjent':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'avvik':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'kritisk':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'godkjent':
        return actualTheme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800';
      case 'avvik':
        return actualTheme === 'dark' ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'kritisk':
        return actualTheme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800';
      default:
        return actualTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${
            actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Sikkerhetsarkiv
          </h1>
          <p className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Arkiverte sikkerhetskontroller og dokumenter
          </p>
        </div>

        <DataExport
          data={arkiverteKontroller}
          filename="sikkerhetsarkiv"
          selectedItems={selectedIds}
          onExport={async (format, data) => {
            console.log('Eksporter arkiv:', format, data);
          }}
        />
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchConfig={{
          placeholder: 'Søk i arkiverte kontroller...',
          fields: ['tittel', 'bedrift', 'kontrollør', 'kategori']
        }}
        filterConfigs={filterConfigs}
        onSearch={(query) => console.log('Søk:', query)}
        onFilter={(filters) => console.log('Filtrer:', filters)}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedIds}
        totalItems={arkiverteKontroller.length}
        actions={bulkActions}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
      />

      {/* Archive Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
        <div className={`p-4 rounded-lg border ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center">
            <ArchiveBoxIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Totalt arkivert
              </p>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {arkiverteKontroller.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Dokumenter
              </p>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {arkiverteKontroller.reduce((sum, k) => sum + k.dokumenter, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Kan slettes
              </p>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {arkiverteKontroller.filter(k => k.kanSlettes).length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          actualTheme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total størrelse
              </p>
              <p className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                8.2 MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Archive List */}
      <div className={`border rounded-lg overflow-hidden ${
        actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={actualTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.length === arkiverteKontroller.length}
                  onChange={selectedIds.length === arkiverteKontroller.length ? deselectAll : selectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                />
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontroll
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bedrift
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arkivering
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dokumenter
              </th>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${actualTheme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            {arkiverteKontroller.map((kontroll) => (
              <tr key={kontroll.id} className={actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-2 py-1 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected(kontroll.id)}
                    onChange={() => toggleItem(kontroll.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                </td>
                <td className="px-2 py-1">
                  <div>
                    <div className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {kontroll.tittel}
                    </div>
                    <div className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {kontroll.kontrollId} • {kontroll.kontrollør}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kontroll.status)}`}>
                    {getStatusIcon(kontroll.status)}
                    <span className="ml-1">{kontroll.status}</span>
                  </span>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {kontroll.bedrift}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {kontroll.arkiveringsDato}
                  </div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {kontroll.oppbevaringsPeriode}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className={`text-sm ${
                    actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {kontroll.dokumenter} filer
                  </div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {kontroll.størrelse}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedKontroll(kontroll);
                        detailsModal.open();
                      }}
                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      title="Se detaljer"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => console.log('Gjenopprett:', kontroll.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-green-600"
                      title="Gjenopprett"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedKontroll && (
        <Modal
          isOpen={detailsModal.isOpen}
          onClose={detailsModal.close}
          title="Arkivdetaljer"
          size="lg"
        >
          <div className="cards-spacing-vertical">
            <div className="grid grid-cols-2 cards-spacing-grid">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Kontroll ID
                </label>
                <p className={actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                  {selectedKontroll.kontrollId}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedKontroll.status)}`}>
                  {getStatusIcon(selectedKontroll.status)}
                  <span className="ml-1">{selectedKontroll.status}</span>
                </span>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tittel
              </label>
              <p className={actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                {selectedKontroll.tittel}
              </p>
            </div>

            <div className="grid grid-cols-2 cards-spacing-grid">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Årsak til arkivering
                </label>
                <p className={actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                  {selectedKontroll.årsak}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Oppbevaringsperiode
                </label>
                <p className={actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                  {selectedKontroll.oppbevaringsPeriode}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SikkerhetskontrollArkiv; 
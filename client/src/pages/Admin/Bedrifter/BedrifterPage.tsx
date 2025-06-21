import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { usePaginatedApi } from '../../hooks/useApi';
import { bedrifterService } from '../../services/bedrifter';
import { Bedrift } from '../../types/admin';

export const BedrifterPage: React.FC = () => {
  const [selectedBedrifter, setSelectedBedrifter] = useState<Bedrift[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'services' | 'billing'>('overview');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch bedrifter
  const {
    data: bedrifter,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    goToPage,
    setLimit,
    refresh
  } = usePaginatedApi<Bedrift>(
    (params) => bedrifterService.getBedrifter(params),
    { immediate: true }
  );

  const handleBedriftAction = async (bedrift: Bedrift, action: 'activate' | 'suspend' | 'delete') => {
    const actionText = {
      activate: 'aktivere',
      suspend: 'suspendere',
      delete: 'slette'
    }[action];

    if (!window.confirm(`Er du sikker på at du vil ${actionText} bedriften "${bedrift.navn}"?`)) {
      return;
    }

    setActionInProgress(bedrift.id.toString());
    try {
      await bedrifterService.performBedriftAction(bedrift.id, action);
      refresh();
      alert(`Bedrift "${bedrift.navn}" ${actionText} vellykket`);
    } catch (error: any) {
      alert(`Feil ved ${actionText} av bedrift: ${error.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkAction = async (action: string, bedrifter: Bedrift[]) => {
    if (!window.confirm(`Er du sikker på at du vil ${action} ${bedrifter.length} bedrifter?`)) {
      return;
    }

    try {
      for (const bedrift of bedrifter) {
        await bedrifterService.performBedriftAction(bedrift.id, action as any);
      }
      setSelectedBedrifter([]);
      refresh();
      alert(`${action} utført for ${bedrifter.length} bedrifter`);
    } catch (error: any) {
      alert(`Feil ved bulk ${action}: ${error.message}`);
    }
  };

  const getStatusIcon = (status: Bedrift['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'INACTIVE':
        return <XMarkIcon className="w-5 h-5 text-gray-500" />;
      case 'SUSPENDED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CogIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Bedrift['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'I dag';
    if (diffInDays === 1) return 'I går';
    if (diffInDays < 7) return `${diffInDays} dager siden`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} uker siden`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} måneder siden`;
    return `${Math.floor(diffInDays / 365)} år siden`;
  };

  const columns: Column<Bedrift>[] = [
    {
      key: 'navn',
      title: 'Bedriftsnavn',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{row.organisasjonsnummer}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value === 'ACTIVE' ? 'Aktiv' : 
             value === 'INACTIVE' ? 'Inaktiv' : 'Suspendert'}
          </span>
        </div>
      )
    },
    {
      key: 'hovedbruker',
      title: 'Hovedbruker',
      render: (value) => (
        <div>
          {value ? (
            <>
              <div className="text-sm font-medium text-gray-900">
                {value.fornavn} {value.etternavn}
              </div>
              <div className="text-xs text-gray-500">{value.epost}</div>
            </>
          ) : (
            <span className="text-sm text-gray-400">Ingen hovedbruker</span>
          )}
        </div>
      )
    },
    {
      key: 'ansatte',
      title: 'Ansatte',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'elever',
      title: 'Elever',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'aktiveTjenester',
      title: 'Aktive Tjenester',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'opprettet',
      title: 'Opprettet',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString('nb-NO')}
          </div>
          <div className="text-xs text-gray-500">
            {formatTimeAgo(value)}
          </div>
        </div>
      )
    },
    {
      key: 'sistAktiv',
      title: 'Sist Aktiv',
      sortable: true,
      render: (value) => (
        <div>
          {value ? (
            <>
              <div className="text-sm text-gray-900">
                {new Date(value).toLocaleDateString('nb-NO')}
              </div>
              <div className="text-xs text-gray-500">
                {formatTimeAgo(value)}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">Aldri</span>
          )}
        </div>
      )
    },
    {
      key: 'adresse',
      title: 'Lokasjon',
      render: (value, row) => (
        <div>
          {value ? (
            <>
              <div className="text-sm text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">
                {row.postnummer} {row.poststed}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">Ikke oppgitt</span>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Detaljer',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => {
        alert(`Åpner detaljer for ${bedrift.navn}`);
      },
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Rediger',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => {
        alert(`Redigerer ${bedrift.navn}`);
      },
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Aktiver',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => handleBedriftAction(bedrift, 'activate'),
      show: (bedrift: Bedrift) => bedrift.status !== 'ACTIVE',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Suspender',
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => handleBedriftAction(bedrift, 'suspend'),
      show: (bedrift: Bedrift) => bedrift.status === 'ACTIVE',
      className: 'text-yellow-600 hover:text-yellow-900'
    },
    {
      label: 'Slett',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => handleBedriftAction(bedrift, 'delete'),
      className: 'text-red-600 hover:text-red-900'
    },
    {
      label: 'Tjenester',
      icon: <CogIcon className="w-4 h-4" />,
      onClick: (bedrift: Bedrift) => {
        alert(`Åpner tjenester for ${bedrift.navn}`);
      },
      className: 'text-purple-600 hover:text-purple-900'
    }
  ];

  const bulkActions = [
    {
      label: 'Aktiver Valgte',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (bedrifter: Bedrift[]) => handleBulkAction('activate', bedrifter),
      className: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      label: 'Suspender Valgte',
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      onClick: (bedrifter: Bedrift[]) => handleBulkAction('suspend', bedrifter),
      className: 'bg-yellow-600 text-white hover:bg-yellow-700'
    },
    {
      label: 'Slett Valgte',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (bedrifter: Bedrift[]) => handleBulkAction('delete', bedrifter),
      className: 'bg-red-600 text-white hover:bg-red-700'
    }
  ];

  const tableFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Aktiv' },
        { value: 'INACTIVE', label: 'Inaktiv' },
        { value: 'SUSPENDED', label: 'Suspendert' }
      ]
    },
    {
      key: 'hasMainUser',
      label: 'Hovedbruker',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Har hovedbruker' },
        { value: 'false', label: 'Mangler hovedbruker' }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Oversikt', icon: BuildingOfficeIcon },
    { id: 'analytics', name: 'Analyse', icon: ChartBarIcon },
    { id: 'services', name: 'Tjenester', icon: CogIcon },
    { id: 'billing', name: 'Fakturering', icon: BanknotesIcon }
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Feil ved lasting</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            onClick={refresh}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  const activeBedrifter = (bedrifter as Bedrift[])?.filter((b) => b.status === 'ACTIVE').length || 0;
  const suspendedBedrifter = (bedrifter as Bedrift[])?.filter((b) => b.status === 'SUSPENDED').length || 0;
  const totalAnsatte = (bedrifter as Bedrift[])?.reduce((sum, b) => sum + b.ansatte, 0) || 0;
  const totalElever = (bedrifter as Bedrift[])?.reduce((sum, b) => sum + b.elever, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bedrifter</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer og overvåk alle registrerte bedrifter
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
          <button
            onClick={() => alert('Åpner ny bedrift dialog')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Ny Bedrift
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Aktive bedrifter"
          value={activeBedrifter}
          icon={<BuildingOfficeIcon className="w-6 h-6 text-green-400" />}
        />
        <StatCard
          title="Bedrifter med varsler"
          value={suspendedBedrifter}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
        />
        <StatCard
          title="Totalt antall bedrifter"
          value={activeBedrifter + suspendedBedrifter}
          icon={<UserGroupIcon className="w-6 h-6 text-blue-400" />}
        />
        <StatCard
          title="Bedrifter under opplæring"
          value={totalElever}
          icon={<ShieldCheckIcon className="w-6 h-6 text-yellow-400" />}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Suspended Companies Alert */}
          {suspendedBedrifter > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Suspenderte bedrifter krever oppmerksomhet
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {suspendedBedrifter} bedrifter er for øyeblikket suspendert. 
                      Vennligst gjennomgå og håndter disse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Companies Table */}
          <DataTable
            data={(bedrifter as Bedrift[]) || []}
            columns={columns}
            loading={loading}
            pagination={{
              page,
              limit,
              total,
              totalPages
            }}
            filters={tableFilters}
            actions={actions}
            selectable={true}
            selectedRows={selectedBedrifter}
            onSelectionChange={setSelectedBedrifter}
            bulkActions={bulkActions}
            onPageChange={goToPage}
            onLimitChange={setLimit}
            emptyMessage="Ingen bedrifter funnet"
            className="bg-white"
            rowClassName={(row) => 
              row.status === 'SUSPENDED' ? 'bg-yellow-50 hover:bg-yellow-100' :
              row.status === 'INACTIVE' ? 'bg-gray-50 hover:bg-gray-100' : ''
            }
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bedrifter per Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aktive</span>
                  <span className="text-sm font-medium text-gray-900">{activeBedrifter}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(activeBedrifter / (bedrifter?.length || 1)) * 100}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Suspenderte</span>
                  <span className="text-sm font-medium text-gray-900">{suspendedBedrifter}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(suspendedBedrifter / (bedrifter?.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nylige Registreringer</h3>
              <div className="space-y-2">
                {(bedrifter as Bedrift[])?.slice(0, 5).map((bedrift) => (
                  <div key={bedrift.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-900">{bedrift.navn}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(bedrift.opprettet)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tjeneste Oversikt</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(bedrifter as Bedrift[])?.slice(0, 6).map((bedrift) => (
              <div key={bedrift.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{bedrift.navn}</h4>
                  {getStatusIcon(bedrift.status)}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Aktive tjenester:</span>
                    <span className="font-medium">{bedrift.aktiveTjenester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ansatte:</span>
                    <span className="font-medium">{bedrift.ansatte}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elever:</span>
                    <span className="font-medium">{bedrift.elever}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => alert(`Åpner tjenester for ${bedrift.navn}`)}
                    className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Administrer Tjenester
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fakturering og Abonnement</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BanknotesIcon className="w-8 h-8 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Månedlig Inntekt</p>
                    <p className="text-lg font-bold text-green-900">kr 125,000</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Utestående Fakturaer</p>
                    <p className="text-lg font-bold text-blue-900">3</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="w-8 h-8 text-purple-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800">Gjennomsnittlig MRR</p>
                    <p className="text-lg font-bold text-purple-900">kr 2,850</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bedrift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abonnement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Månedlig Kostnad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Neste Faktura
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(bedrifter as Bedrift[])?.slice(0, 10).map((bedrift) => (
                    <tr key={bedrift.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bedrift.navn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Premium ({bedrift.aktiveTjenester} tjenester)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        kr {(bedrift.aktiveTjenester * 500 + bedrift.ansatte * 50).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Betalt
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nb-NO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; export default BedrifterPage;

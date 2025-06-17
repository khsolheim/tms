import React, { useState } from 'react';
import {
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { usePaginatedApi } from '../../hooks/useApi';
import { brukereService } from '../../services/brukere';
import { Bruker } from '../../types/admin';

export const BrukerePage: React.FC = () => {
  const [selectedBrukere, setSelectedBrukere] = useState<Bruker[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'activity' | 'security'>('overview');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch brukere
  const {
    data: brukere,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    goToPage,
    setLimit,
    refresh
  } = usePaginatedApi<Bruker>(
    (params) => brukereService.getBrukere(params),
    { immediate: true }
  );

  const handleBrukerAction = async (bruker: Bruker, action: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'resetPassword' | 'delete') => {
    const actionText = {
      activate: 'aktivere',
      deactivate: 'deaktivere',
      lock: 'låse',
      unlock: 'låse opp',
      resetPassword: 'tilbakestille passord for',
      delete: 'slette'
    }[action];

    if (!window.confirm(`Er du sikker på at du vil ${actionText} brukeren "${bruker.fornavn} ${bruker.etternavn}"?`)) {
      return;
    }

    setActionInProgress(bruker.id.toString());
    try {
      await brukereService.performBrukerAction(bruker.id, action);
      refresh();
      alert(`Bruker "${bruker.fornavn} ${bruker.etternavn}" ${actionText} vellykket`);
    } catch (error: any) {
      alert(`Feil ved ${actionText} av bruker: ${error.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkAction = async (action: string, brukere: Bruker[]) => {
    if (!window.confirm(`Er du sikker på at du vil ${action} ${brukere.length} brukere?`)) {
      return;
    }

    try {
      for (const bruker of brukere) {
        await brukereService.performBrukerAction(bruker.id, action as any);
      }
      setSelectedBrukere([]);
      refresh();
      alert(`${action} utført for ${brukere.length} brukere`);
    } catch (error: any) {
      alert(`Feil ved bulk ${action}: ${error.message}`);
    }
  };

  const getStatusIcon = (status: Bruker['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'INACTIVE':
        return <XMarkIcon className="w-5 h-5 text-gray-500" />;
      case 'LOCKED':
        return <LockClosedIcon className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Bruker['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'LOCKED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'HOVEDBRUKER':
        return 'bg-green-100 text-green-800';
      case 'ANSATT':
        return 'bg-gray-100 text-gray-800';
      case 'ELEV':
        return 'bg-orange-100 text-orange-800';
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

  const columns: Column<Bruker>[] = [
    {
      key: 'navn',
      title: 'Navn',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.fornavn} {row.etternavn}
            </div>
            <div className="text-xs text-gray-500">{row.epost}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rolle',
      title: 'Rolle',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
          {value === 'SUPER_ADMIN' ? 'Super Admin' :
           value === 'ADMIN' ? 'Admin' :
           value === 'HOVEDBRUKER' ? 'Hovedbruker' :
           value === 'ANSATT' ? 'Ansatt' : 'Elev'}
        </span>
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
             value === 'INACTIVE' ? 'Inaktiv' : 
             value === 'LOCKED' ? 'Låst' : 'Venter'}
          </span>
        </div>
      )
    },
    {
      key: 'bedrift',
      title: 'Bedrift',
      render: (value) => (
        <div>
          {value ? (
            <>
              <div className="text-sm font-medium text-gray-900">{value.navn}</div>
              <div className="text-xs text-gray-500">{value.organisasjonsnummer}</div>
            </>
          ) : (
            <span className="text-sm text-gray-400">Ingen bedrift</span>
          )}
        </div>
      )
    },
    {
      key: 'telefon',
      title: 'Kontakt',
      render: (value, row) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center text-xs text-gray-600">
              <DevicePhoneMobileIcon className="w-3 h-3 mr-1" />
              {value}
            </div>
          )}
          <div className="flex items-center text-xs text-gray-600">
            <EnvelopeIcon className="w-3 h-3 mr-1" />
            {row.epost}
          </div>
        </div>
      )
    },
    {
      key: 'sistInnlogget',
      title: 'Sist Innlogget',
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
      key: 'tofaAktivert',
      title: '2FA',
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Detaljer',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => {
        alert(`Åpner detaljer for ${bruker.fornavn} ${bruker.etternavn}`);
      },
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Rediger',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => {
        alert(`Redigerer ${bruker.fornavn} ${bruker.etternavn}`);
      },
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Aktiver',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'activate'),
      show: (bruker: Bruker) => bruker.status !== 'ACTIVE',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Deaktiver',
      icon: <XMarkIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'deactivate'),
      show: (bruker: Bruker) => bruker.status === 'ACTIVE',
      className: 'text-yellow-600 hover:text-yellow-900'
    },
    {
      label: 'Lås',
      icon: <LockClosedIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'lock'),
      show: (bruker: Bruker) => bruker.status !== 'LOCKED',
      className: 'text-red-600 hover:text-red-900'
    },
    {
      label: 'Lås opp',
      icon: <LockOpenIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'unlock'),
      show: (bruker: Bruker) => bruker.status === 'LOCKED',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Tilbakestill Passord',
      icon: <KeyIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'resetPassword'),
      className: 'text-purple-600 hover:text-purple-900'
    },
    {
      label: 'Slett',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: (bruker: Bruker) => handleBrukerAction(bruker, 'delete'),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  const bulkActions = [
    {
      label: 'Aktiver Valgte',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      onClick: (brukere: Bruker[]) => handleBulkAction('activate', brukere),
      className: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      label: 'Deaktiver Valgte',
      icon: <XMarkIcon className="w-4 h-4" />,
      onClick: (brukere: Bruker[]) => handleBulkAction('deactivate', brukere),
      className: 'bg-yellow-600 text-white hover:bg-yellow-700'
    },
    {
      label: 'Lås Valgte',
      icon: <LockClosedIcon className="w-4 h-4" />,
      onClick: (brukere: Bruker[]) => handleBulkAction('lock', brukere),
      className: 'bg-red-600 text-white hover:bg-red-700'
    },
    {
      label: 'Tilbakestill Passord',
      icon: <KeyIcon className="w-4 h-4" />,
      onClick: (brukere: Bruker[]) => handleBulkAction('resetPassword', brukere),
      className: 'bg-purple-600 text-white hover:bg-purple-700'
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
        { value: 'LOCKED', label: 'Låst' },
        { value: 'PENDING', label: 'Venter' }
      ]
    },
    {
      key: 'rolle',
      label: 'Rolle',
      type: 'select' as const,
      options: [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'HOVEDBRUKER', label: 'Hovedbruker' },
        { value: 'ANSATT', label: 'Ansatt' },
        { value: 'ELEV', label: 'Elev' }
      ]
    },
    {
      key: 'tofaAktivert',
      label: '2FA',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Aktivert' },
        { value: 'false', label: 'Ikke aktivert' }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Oversikt', icon: UserIcon },
    { id: 'roles', name: 'Roller', icon: ShieldCheckIcon },
    { id: 'activity', name: 'Aktivitet', icon: ChartBarIcon },
    { id: 'security', name: 'Sikkerhet', icon: LockClosedIcon }
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

  const activeBrukere = (brukere as Bruker[])?.filter((b) => b.status === 'ACTIVE').length || 0;
  const lockedBrukere = (brukere as Bruker[])?.filter((b) => b.status === 'LOCKED').length || 0;
  const pendingBrukere = (brukere as Bruker[])?.filter((b) => b.status === 'PENDING').length || 0;
  const tofaUsers = (brukere as Bruker[])?.filter((b) => b.tofaAktivert).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brukere</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer og overvåk alle systembrukere
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
            onClick={() => alert('Åpner ny bruker dialog')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Ny Bruker
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Aktive brukere"
          value={activeBrukere}
          icon={<UserIcon className="w-6 h-6 text-green-400" />}
        />
        <StatCard
          title="Låste brukere"
          value={lockedBrukere}
          icon={<LockClosedIcon className="w-6 h-6 text-red-400" />}
        />
        <StatCard
          title="Venter på aktivering"
          value={pendingBrukere}
          icon={<ClockIcon className="w-6 h-6 text-yellow-400" />}
        />
        <StatCard
          title="2FA-brukere"
          value={tofaUsers}
          icon={<ShieldCheckIcon className="w-6 h-6 text-blue-400" />}
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
          {/* Locked Users Alert */}
          {lockedBrukere > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <LockClosedIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Låste brukere krever oppmerksomhet
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {lockedBrukere} brukere er for øyeblikket låst. 
                      Vennligst gjennomgå og håndter disse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <DataTable
            data={(brukere as Bruker[]) || []}
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
            selectedRows={selectedBrukere}
            onSelectionChange={setSelectedBrukere}
            bulkActions={bulkActions}
            onPageChange={goToPage}
            onLimitChange={setLimit}
            emptyMessage="Ingen brukere funnet"
            className="bg-white"
            rowClassName={(row) => 
              row.status === 'LOCKED' ? 'bg-red-50 hover:bg-red-100' :
              row.status === 'PENDING' ? 'bg-yellow-50 hover:bg-yellow-100' :
              row.status === 'INACTIVE' ? 'bg-gray-50 hover:bg-gray-100' : ''
            }
          />
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['SUPER_ADMIN', 'ADMIN', 'HOVEDBRUKER', 'ANSATT', 'ELEV'].map((role) => {
              const roleUsers = (brukere as Bruker[])?.filter((b) => b.rolle === role) || [];
              const roleName = {
                SUPER_ADMIN: 'Super Admin',
                ADMIN: 'Admin',
                HOVEDBRUKER: 'Hovedbruker',
                ANSATT: 'Ansatt',
                ELEV: 'Elev'
              }[role];

              return (
                <div key={role} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{roleName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                      {roleUsers.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {roleUsers.slice(0, 5).map((bruker) => (
                      <div key={bruker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {bruker.fornavn} {bruker.etternavn}
                          </span>
                          <div className="text-xs text-gray-500">{bruker.epost}</div>
                        </div>
                        {getStatusIcon(bruker.status)}
                      </div>
                    ))}
                    {roleUsers.length > 5 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        +{roleUsers.length - 5} flere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Innloggingsaktivitet</h3>
              <div className="space-y-3">
                {(brukere as Bruker[])?.filter((b) => b.sistInnlogget).slice(0, 8).map((bruker) => (
                  <div key={bruker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {bruker.fornavn} {bruker.etternavn}
                      </span>
                      <div className="text-xs text-gray-500">{bruker.epost}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {bruker.sistInnlogget && formatTimeAgo(bruker.sistInnlogget)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nylige Registreringer</h3>
              <div className="space-y-2">
                {(brukere as Bruker[])?.slice(0, 8).map((bruker) => (
                  <div key={bruker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {bruker.fornavn} {bruker.etternavn}
                      </span>
                      <div className="text-xs text-gray-500">{bruker.rolle}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(bruker.opprettet)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">2FA Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aktivert</span>
                  <span className="text-sm font-medium text-green-600">{tofaUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(tofaUsers / (brukere?.length || 1)) * 100}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ikke aktivert</span>
                  <span className="text-sm font-medium text-red-600">{(brukere?.length || 0) - tofaUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${((brukere?.length || 0) - tofaUsers) / (brukere?.length || 1) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sikkerhetsstatus</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-800">Aktive brukere</span>
                  <span className="text-sm font-medium text-green-900">{activeBrukere}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">Låste brukere</span>
                  <span className="text-sm font-medium text-red-900">{lockedBrukere}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-800">Ventende brukere</span>
                  <span className="text-sm font-medium text-yellow-900">{pendingBrukere}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sikkerhetshandlinger</h3>
              <div className="space-y-2">
                <button
                  onClick={() => alert('Tvinger alle brukere til å endre passord')}
                  className="w-full px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  Tving passordendring
                </button>
                <button
                  onClick={() => alert('Låser alle inaktive brukere')}
                  className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Lås inaktive brukere
                </button>
                <button
                  onClick={() => alert('Sender 2FA påminnelse til alle')}
                  className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Send 2FA påminnelse
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brukere uten 2FA</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bruker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rolle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sist Innlogget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(brukere as Bruker[])?.filter((b) => !b.tofaAktivert).slice(0, 10).map((bruker) => (
                    <tr key={bruker.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {bruker.fornavn} {bruker.etternavn}
                            </div>
                            <div className="text-xs text-gray-500">{bruker.epost}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(bruker.rolle)}`}>
                          {bruker.rolle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bruker.sistInnlogget ? formatTimeAgo(bruker.sistInnlogget) : 'Aldri'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => alert(`Sender 2FA påminnelse til ${bruker.fornavn} ${bruker.etternavn}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Send påminnelse
                        </button>
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
}; 
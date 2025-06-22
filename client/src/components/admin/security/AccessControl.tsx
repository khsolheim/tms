import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { DataTable, Column } from '../common/DataTable';
import { usePaginatedApi } from '../../../hooks/admin/useApi';
import { securityService } from '../../../services/admin/security';
import { AccessControl as AccessControlType } from '../../../types/admin';
import { StatCard } from '../common/StatCard';

export const AccessControl: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<AccessControlType[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AccessControlType | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Filter configuration for DataTable
  const filters = [
    {
      key: 'role',
      label: 'Rolle',
      type: 'select' as const,
      options: [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'HR_MANAGER', label: 'HR Manager' },
        { value: 'INSTRUCTOR', label: 'Instruktør' },
        { value: 'EMPLOYEE', label: 'Ansatt' },
        { value: 'STUDENT', label: 'Elev' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Aktiv' },
        { value: 'locked', label: 'Låst' },
        { value: 'inactive', label: 'Inaktiv' }
      ]
    },
    {
      key: 'search',
      label: 'Søk',
      type: 'text' as const,
      placeholder: 'Søk etter navn eller e-post...'
    }
  ];

  // Fetch access control data
  const {
    data: usersResponse,
    loading,
    error,
    page,
    limit,
    total,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    setLimit,
    refresh
  } = usePaginatedApi<AccessControlType>(
    (params) => securityService.getAccessControl(params),
    { immediate: true }
  );

  // Extract users from paginated response
  const users = usersResponse?.data || [];

  const handleLockUser = async (user: AccessControlType) => {
    if (!window.confirm(`Er du sikker på at du vil låse brukeren ${user.userName}?`)) {
      return;
    }

    try {
      await securityService.lockUser(user.userId);
      refresh();
    } catch (error: any) {
      alert(`Feil ved låsing av bruker: ${error.message}`);
    }
  };

  const handleUnlockUser = async (user: AccessControlType) => {
    try {
      await securityService.unlockUser(user.userId);
      refresh();
    } catch (error: any) {
      alert(`Feil ved opplåsing av bruker: ${error.message}`);
    }
  };

  const handleResetPassword = async (user: AccessControlType) => {
    if (!window.confirm(`Er du sikker på at du vil tilbakestille passordet for ${user.userName}?`)) {
      return;
    }

    try {
      await securityService.resetUserPassword(user.userId);
      alert('Passord tilbakestilt. E-post sendt til bruker.');
    } catch (error: any) {
      alert(`Feil ved tilbakestilling av passord: ${error.message}`);
    }
  };

  const handleBulkAction = async (action: string, users: AccessControlType[]) => {
    const userNames = users.map(u => u.userName).join(', ');
    
    if (!window.confirm(`Er du sikker på at du vil ${action} for ${users.length} brukere: ${userNames}?`)) {
      return;
    }

    try {
      for (const user of users) {
        switch (action) {
          case 'lock':
            await securityService.lockUser(user.userId);
            break;
          case 'unlock':
            await securityService.unlockUser(user.userId);
            break;
          case 'reset-password':
            await securityService.resetUserPassword(user.userId);
            break;
        }
      }
      setSelectedUsers([]);
      refresh();
      alert(`${action} utført for ${users.length} brukere`);
    } catch (error: any) {
      alert(`Feil ved bulk ${action}: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'locked':
        return <LockClosedIcon className="w-4 h-4 text-red-500" />;
      case 'inactive':
        return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'HR_MANAGER':
        return 'bg-green-100 text-green-800';
      case 'INSTRUCTOR':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<AccessControlType>[] = [
    {
      key: 'userName',
      title: 'Bruker',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rolle',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
          {value}
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
            {value === 'active' ? 'Aktiv' : value === 'locked' ? 'Låst' : 'Inaktiv'}
          </span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      title: 'Sist Innlogget',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('nb-NO') : 'Aldri'
    },
    {
      key: 'failedLoginAttempts',
      title: 'Mislykkede Forsøk',
      sortable: true,
      render: (value) => (
        <span className={`font-medium ${value > 3 ? 'text-red-600' : value > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'permissions',
      title: 'Tilganger',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((permission, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {permission}
            </span>
          ))}
          {value.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{value.length - 3}
            </span>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Rediger',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: (user: AccessControlType) => {
        setEditingUser(user);
        setShowUserModal(true);
      },
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Lås',
      icon: <LockClosedIcon className="w-4 h-4" />,
      onClick: handleLockUser,
      show: (user: AccessControlType) => user.status === 'active',
      className: 'text-red-600 hover:text-red-900'
    },
    {
      label: 'Lås opp',
      icon: <LockOpenIcon className="w-4 h-4" />,
      onClick: handleUnlockUser,
      show: (user: AccessControlType) => user.status === 'locked',
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Reset Passord',
      icon: <KeyIcon className="w-4 h-4" />,
      onClick: handleResetPassword,
      className: 'text-yellow-600 hover:text-yellow-900'
    }
  ];

  const bulkActions = [
    {
      label: 'Lås Valgte',
      icon: <LockClosedIcon className="w-4 h-4" />,
      onClick: (users: AccessControlType[]) => handleBulkAction('lock', users),
      className: 'bg-red-600 text-white hover:bg-red-700'
    },
    {
      label: 'Lås Opp Valgte',
      icon: <LockOpenIcon className="w-4 h-4" />,
      onClick: (users: AccessControlType[]) => handleBulkAction('unlock', users),
      className: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      label: 'Reset Passord',
      icon: <KeyIcon className="w-4 h-4" />,
      onClick: (users: AccessControlType[]) => handleBulkAction('reset-password', users),
      className: 'bg-yellow-600 text-white hover:bg-yellow-700'
    }
  ];

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
  };

  const handleSuspendUser = (userId: string) => {
    console.log('Suspend user:', userId);
  };

  const handleBulkRoleChange = () => {
    if (selectedUsers.length === 0) {
      alert('Vennligst velg brukere først');
      return;
    }
    setShowRoleModal(true);
  };

  const handleRoleUpdate = () => {
    console.log('Update role for users:', selectedUsers, 'to:', selectedRole);
    setShowRoleModal(false);
    setSelectedUsers([]);
    setSelectedRole('');
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Tilgangskontroll</h2>
          <p className="mt-1 text-sm text-gray-500">
            Administrer bruker tilganger, roller og sikkerhetsstatus
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserIcon className="w-4 h-4 mr-2" />
          Ny Bruker
        </button>
      </div>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sikre Brukere
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users?.filter(u => u.status === 'active' && u.failedLoginAttempts === 0).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LockClosedIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Låste Brukere
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users?.filter(u => u.status === 'locked').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Risiko Brukere
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users?.filter(u => u.failedLoginAttempts > 3).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users || []}
        columns={columns}
        loading={loading}
        pagination={{
          page,
          limit,
          total,
          totalPages: 1 // Assuming totalPages is not available in the new API response
        }}
        filters={filters}
        actions={actions}
        selectable={true}
        selectedRows={selectedUsers}
        onSelectionChange={setSelectedUsers}
        bulkActions={bulkActions}
        onPageChange={goToPage}
        onLimitChange={setLimit}
        emptyMessage="Ingen brukere funnet"
        className="bg-white"
      />

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Rediger Bruker' : 'Ny Bruker'}
              </h3>
              
              {/* Modal content would go here */}
              <div className="text-center text-gray-500 py-8">
                Bruker modal implementering kommer...
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Lagre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Endre Rolle
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Endre rolle for {selectedUsers.length} valgte brukere
              </p>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="">Velg rolle</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="INSTRUCTOR">Instruktør</option>
                <option value="EMPLOYEE">Ansatt</option>
                <option value="STUDENT">Elev</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleRoleUpdate}
                  disabled={!selectedRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Oppdater Rolle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
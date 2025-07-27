import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface PageAccess {
  id: number;
  pageName: string;
  pagePath: string;
  description: string;
  isActive: boolean;
  allowedRoles: string[];
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function PageAccessAdmin() {
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALLE' | 'AKTIVE' | 'INAKTIVE'>('ALLE');

  useEffect(() => {
    fetchPageAccess();
    fetchRoles();
  }, []);

  const fetchPageAccess = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/page-access', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente side-tilganger');
      }

      const data = await response.json();
      setPageAccess(data);
    } catch (error) {
      console.error('Feil ved henting av side-tilganger:', error);
      toast.error('Kunne ikke hente side-tilganger');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente roller');
      }

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Feil ved henting av roller:', error);
      toast.error('Kunne ikke hente roller');
    }
  };

  const handleTogglePageAccess = async (pageId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/page-access/${pageId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere side-tilgang');
      }

      toast.success(`Side ${isActive ? 'deaktivert' : 'aktivert'}`);
      fetchPageAccess();
    } catch (error) {
      console.error('Feil ved oppdatering av side-tilgang:', error);
      toast.error('Kunne ikke oppdatere side-tilgang');
    }
  };

  const handleUpdateRoles = async (pageId: number, allowedRoles: string[]) => {
    try {
      const response = await fetch(`/api/admin/page-access/${pageId}/roles`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowedRoles })
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere roller');
      }

      toast.success('Roller oppdatert');
      fetchPageAccess();
    } catch (error) {
      console.error('Feil ved oppdatering av roller:', error);
      toast.error('Kunne ikke oppdatere roller');
    }
  };

  const filteredPageAccess = pageAccess.filter(page => {
    if (filter === 'AKTIVE') return page.isActive;
    if (filter === 'INAKTIVE') return !page.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laster side-tilganger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Side-tilgang Administrasjon</h1>
              <p className="text-lg text-gray-600">Administrer hvilke sider som er tilgjengelige for forskjellige brukerroller</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Sider</p>
                <p className="text-2xl font-bold text-gray-900">{pageAccess.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Sider</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pageAccess.filter(page => page.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Brukerroller</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">Filtrer Sider</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALLE">Alle sider</option>
                  <option value="AKTIVE">Aktive</option>
                  <option value="INAKTIVE">Inaktive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {filteredPageAccess.length === 0 ? (
            <div className="text-center py-12">
              <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen sider funnet</h3>
              <p className="text-gray-500">Prøv å endre filtrene.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tillatte Roller
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPageAccess.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{page.pageName}</div>
                          <div className="text-sm text-gray-500">{page.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{page.pagePath}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {page.isActive ? (
                            <>
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Aktiv
                            </>
                          ) : (
                            <>
                              <EyeSlashIcon className="h-3 w-3 mr-1" />
                              Inaktiv
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {page.allowedRoles.map(role => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTogglePageAccess(page.id, page.isActive)}
                            className={`p-1 rounded ${
                              page.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={page.isActive ? 'Deaktiver' : 'Aktiver'}
                          >
                            {page.isActive ? (
                              <XMarkIcon className="h-4 w-4" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
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

        {/* Available Roles */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tilgjengelige Brukerroller</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => (
                <div key={role.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{role.name}</h4>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  salary: number;
  skills: string[];
}

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Simulerer API-kall med mock-data
      const mockEmployees: Employee[] = [
        {
          id: 1,
          name: 'Ola Nordmann',
          email: 'ola.nordmann@bedrift.no',
          phone: '+47 123 45 678',
          position: 'Sikkerhetskonsulent',
          department: 'Sikkerhet',
          status: 'active',
          hireDate: '2022-01-15',
          salary: 650000,
          skills: ['Sikkerhetskontroll', 'Risikoanalyse', 'Rapportering']
        },
        {
          id: 2,
          name: 'Kari Hansen',
          email: 'kari.hansen@bedrift.no',
          phone: '+47 987 65 432',
          position: 'Prosjektleder',
          department: 'Prosjekt',
          status: 'active',
          hireDate: '2021-03-20',
          salary: 750000,
          skills: ['Prosjektledelse', 'Teamledelse', 'Planlegging']
        },
        {
          id: 3,
          name: 'Per Olsen',
          email: 'per.olsen@bedrift.no',
          phone: '+47 555 12 34',
          position: 'Kundekonsulent',
          department: 'Salg',
          status: 'on_leave',
          hireDate: '2023-06-10',
          salary: 550000,
          skills: ['Kundeservice', 'Salg', 'Kommunikasjon']
        }
      ];
      
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Feil ved henting av ansatte:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster ansatte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ansatte</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Ny ansatt
        </button>
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Søk i ansatte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        >
          <option value="all">Alle avdelinger</option>
          <option value="Sikkerhet">Sikkerhet</option>
          <option value="Prosjekt">Prosjekt</option>
          <option value="Salg">Salg</option>
          <option value="HR">HR</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.position}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                  {employee.status === 'active' ? 'Aktiv' : 
                   employee.status === 'inactive' ? 'Inaktiv' : 'Permisjon'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">E-post:</span>
                  <span className="text-gray-900">{employee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telefon:</span>
                  <span className="text-gray-900">{employee.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avdeling:</span>
                  <span className="text-gray-900">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ansettelsesdato:</span>
                  <span className="text-gray-900">{formatDate(employee.hireDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lønn:</span>
                  <span className="text-gray-900">{formatCurrency(employee.salary)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ferdigheter:</h4>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  Vis profil
                </button>
                <button className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300">
                  Rediger
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Ingen ansatte funnet</p>
          <p className="text-gray-400 text-sm">Prøv å endre søkekriteriene</p>
        </div>
      )}
    </div>
  );
};
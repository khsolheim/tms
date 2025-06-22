import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaCar, FaEdit, FaTrash, FaEye, FaSearch, FaTable, FaTh } from 'react-icons/fa';
// Services håndteres direkte via fetch

interface Kjøretøy {
  id: number;
  registreringsnummer: string;
  merke: string;
  modell: string;
  aarsmodell: number;
  type: string;
  status: string;
  forerkortklass: string[];
  opprettet: string;
}

interface Bedrift {
  id: number;
  navn: string;
}

const KjoretoyOversikt: React.FC = () => {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const navigate = useNavigate();
  const [kjøretøy, setKjøretøy] = useState<Kjøretøy[]>([]);
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [laster, setLaster] = useState(true);
  const [søketerm, setSøketerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALLE');
  const [visningstype, setVisningstype] = useState<'tabell' | 'kort'>('tabell');

  useEffect(() => {
    if (bedriftId) {
      lastKjøretøy();
      lastBedrift();
    }
  }, [bedriftId]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastKjøretøy = async () => {
    if (!bedriftId) return;
    
    try {
      setLaster(true);
      const response = await fetch(`/api/bedrifter/${bedriftId}/kjoretoy`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token-123'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKjøretøy(data);
      } else {
        console.error('Feil ved lasting av kjøretøy');
      }
    } catch (error) {
      console.error('Feil ved lasting av kjøretøy:', error);
    } finally {
      setLaster(false);
    }
  };

  const lastBedrift = async () => {
    if (!bedriftId) return;
    
    try {
      const response = await fetch(`/api/bedrifter/${bedriftId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token-123'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBedrift(data);
      }
    } catch (error) {
      console.error('Feil ved lasting av bedrift:', error);
    }
  };

  const slettKjøretøy = async (kjøretøyId: number) => {
    if (!bedriftId) return;
    
    if (!window.confirm('Er du sikker på at du vil slette dette kjøretøyet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bedrifter/${bedriftId}/kjoretoy/${kjøretøyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token-123'}`
        }
      });

      if (response.ok) {
        await lastKjøretøy(); // Oppdater listen
      } else {
        alert('Feil ved sletting av kjøretøy');
      }
    } catch (error) {
      console.error('Feil ved sletting:', error);
      alert('Feil ved sletting av kjøretøy');
    }
  };

  const filtrerteKjøretøy = kjøretøy.filter(k => {
    const matcherSøk = søketerm === '' || 
      k.registreringsnummer.toLowerCase().includes(søketerm.toLowerCase()) ||
      k.merke.toLowerCase().includes(søketerm.toLowerCase()) ||
      k.modell.toLowerCase().includes(søketerm.toLowerCase());
    
    const matcherStatus = statusFilter === 'ALLE' || k.status === statusFilter;
    
    return matcherSøk && matcherStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'AKTIV': 'bg-green-100 text-green-800',
      'INAKTIV': 'bg-gray-100 text-gray-800',
      'SERVICE': 'bg-yellow-100 text-yellow-800',
      'SOLGT': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (laster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster kjøretøy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/bedrifter/${bedriftId}`)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaCar className="w-6 h-6 mr-3 text-blue-600" />
                  Kjøretøy
                </h1>
                <p className="text-gray-600 mt-1">
                  {bedrift?.navn} - {kjøretøy.length} kjøretøy registrert
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/ny`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>Legg til kjøretøy</span>
            </button>
          </div>
        </div>

        {/* Søk og filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Søk etter registreringsnummer, merke eller modell..."
                  value={søketerm}
                  onChange={(e) => setSøketerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALLE">Alle statuser</option>
                <option value="AKTIV">Aktiv</option>
                <option value="INAKTIV">Inaktiv</option>
                <option value="SERVICE">Service</option>
                <option value="SOLGT">Solgt</option>
              </select>
            </div>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setVisningstype('tabell')}
                className={`px-3 py-2 flex items-center space-x-2 transition-colors ${
                  visningstype === 'tabell' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaTable className="w-4 h-4" />
                <span className="hidden sm:inline">Tabell</span>
              </button>
              <button
                onClick={() => setVisningstype('kort')}
                className={`px-3 py-2 flex items-center space-x-2 transition-colors border-l border-gray-300 ${
                  visningstype === 'kort' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FaTh className="w-4 h-4" />
                <span className="hidden sm:inline">Kort</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kjøretøy liste */}
        {filtrerteKjøretøy.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaCar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {kjøretøy.length === 0 ? 'Ingen kjøretøy registrert' : 'Ingen kjøretøy matcher søket'}
            </h3>
            <p className="text-gray-600 mb-4">
              {kjøretøy.length === 0 
                ? 'Kom i gang ved å registrere ditt første kjøretøy' 
                : 'Prøv å endre søkekriteriene dine'}
            </p>
            {kjøretøy.length === 0 && (
              <button
                onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/ny`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Legg til kjøretøy</span>
              </button>
            )}
          </div>
        ) : visningstype === 'tabell' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reg.nr</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kjøretøy</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">År</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Førerkortklasser</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrerteKjøretøy.map((kjøretøy) => (
                    <tr key={kjøretøy.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {kjøretøy.registreringsnummer}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {kjøretøy.merke} {kjøretøy.modell}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">
                        {kjøretøy.aarsmodell}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {kjøretøy.type}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(kjøretøy.status)}`}>
                          {kjøretøy.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {kjøretøy.forerkortklass.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/${kjøretøy.id}`)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Se detaljer"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/${kjøretøy.id}/rediger`)}
                            className="p-1 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Rediger"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => slettKjøretøy(kjøretøy.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Slett"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtrerteKjøretøy.map((kjøretøy) => (
              <div key={kjøretøy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {kjøretøy.registreringsnummer}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {kjøretøy.merke} {kjøretøy.modell}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(kjøretøy.status)}`}>
                    {kjøretøy.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Årsmodell:</span>
                    <span>{kjøretøy.aarsmodell}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{kjøretøy.type}</span>
                  </div>
                  <div>
                    <span className="font-medium">Førerkortklasser:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {kjøretøy.forerkortklass.map((klasse) => (
                        <span key={klasse} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {klasse}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  Registrert: {new Date(kjøretøy.opprettet).toLocaleDateString('nb-NO')}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/${kjøretøy.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Se detaljer"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/bedrifter/${bedriftId}/kjoretoy/${kjøretøy.id}/rediger`)}
                      className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Rediger"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => slettKjøretøy(kjøretøy.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Slett"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KjoretoyOversikt; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaDownload, FaEdit } from 'react-icons/fa';
import { bedriftFaktureringService, type Faktura } from '../../services/bedrift-fakturering.service';

export default function BedriftFakturering() {
  const [fakturaer, setFakturaer] = useState<Faktura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    søk: ''
  });

  useEffect(() => {
    const hentFakturaer = async () => {
      try {
        setLoading(true);
        const data = await bedriftFaktureringService.hentFakturaer({
          ...(filter.status && { status: filter.status })
        });
        setFakturaer(data);
        setError(null);
      } catch (err) {
        console.error('Feil ved henting av fakturaer:', err);
        setError('Kunne ikke hente fakturaer');
      } finally {
        setLoading(false);
      }
    };

    hentFakturaer();
  }, [filter.status]);

  const handleLastNedPdf = async (fakturaId: string, fakturaNummerr: string) => {
    try {
      const blob = await bedriftFaktureringService.genererFakturaPdf(fakturaId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura-${fakturaNummerr}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Feil ved nedlasting av PDF:', err);
      alert('Kunne ikke laste ned PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'betalt': return 'bg-green-100 text-green-800';
      case 'sendt': return 'bg-blue-100 text-blue-800';
      case 'usendt': return 'bg-gray-100 text-gray-800';
      case 'forsinket': return 'bg-red-100 text-red-800';
      case 'kreditert': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'betalt': return 'Betalt';
      case 'sendt': return 'Sendt';
      case 'usendt': return 'Usendt';
      case 'forsinket': return 'Forsinket';
      case 'kreditert': return 'Kreditert';
      default: return status;
    }
  };

  // Filtrer fakturaer basert på søk
  const filtrerteFakturaer = fakturaer.filter(faktura => {
    if (!filter.søk) return true;
    const søk = filter.søk.toLowerCase();
    return (
      faktura.fakturaNummerr.toLowerCase().includes(søk) ||
      faktura.bedriftNavn.toLowerCase().includes(søk) ||
      faktura.beskrivelse.toLowerCase().includes(søk)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Laster fakturaer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Fakturering</h1>
            <Link 
              to="/bedrifter/fakturering/ny" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Ny faktura
            </Link>
          </div>
        </div>

        {/* Filtre */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Søk etter fakturanummer, bedrift eller beskrivelse..."
                value={filter.søk}
                onChange={(e) => setFilter(prev => ({ ...prev, søk: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Alle statuser</option>
                <option value="usendt">Usendt</option>
                <option value="sendt">Sendt</option>
                <option value="betalt">Betalt</option>
                <option value="forsinket">Forsinket</option>
                <option value="kreditert">Kreditert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fakturaer tabell */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fakturanummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bedrift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forfallsdato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beløp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrerteFakturaer.map((faktura) => (
                <tr key={faktura.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {faktura.fakturaNummerr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {faktura.bedriftNavn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(faktura.dato).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(faktura.forfallsdato).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {faktura.totalBeløp.toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(faktura.status)}`}>
                      {getStatusText(faktura.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/bedrifter/fakturering/${faktura.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Vis faktura"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/bedrifter/fakturering/${faktura.id}/rediger`}
                        className="text-green-600 hover:text-green-900"
                        title="Rediger faktura"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleLastNedPdf(faktura.id, faktura.fakturaNummerr)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Last ned PDF"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrerteFakturaer.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {filter.søk || filter.status ? 'Ingen fakturaer funnet med gjeldende filtre' : 'Ingen fakturaer registrert'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
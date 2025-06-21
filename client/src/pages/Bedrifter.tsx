import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaSearch, 
  FaBuilding, 
  FaUsers, 
  FaUserTie,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaTh,
  FaThList
} from 'react-icons/fa';
import api from '../lib/api';
import { StatsCardSkeleton, CardSkeleton, ErrorState } from '../components/ui/LoadingStates';

interface Bedrift {
  id: number;
  navn: string;
  orgNummer: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  telefon?: string;
  epost?: string;
  hovedbruker?: {
    id: number;
    navn: string;
    epost: string;
  };
  ansatte: any[];
  klasser: any[];
  kjoretoy: any[];
  opprettet: string;
}

export default function Bedrifter() {
  const location = useLocation();
  const [sok, setSok] = useState('');
  const [bedrifter, setBedrifter] = useState<Bedrift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [visFilter, setVisFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'navn' | 'ansatte' | 'opprettet'>('navn');
  const [visning, setVisning] = useState<'kort' | 'liste'>('kort');

  useEffect(() => {
    fetchBedrifter();
  }, []);

  // Oppdater listen når brukeren navigerer tilbake til siden
  useEffect(() => {
    if (location.pathname === '/bedrifter') {
      fetchBedrifter();
    }
  }, [location.pathname]);

  const fetchBedrifter = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/bedrifter');
      setBedrifter(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.error('Feil ved henting av bedrifter:', error);
      
      let errorMessage = 'Kunne ikke hente bedrifter';
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
        } else if (status === 403) {
          errorMessage = 'Du har ikke tilgang til å se bedrifter. Kontakt administrator.';
        } else if (data?.error) {
          errorMessage = data.error;
        } else {
          errorMessage = `Server feil (${status}): ${errorMessage}`;
        }
      } else if (error.request) {
        errorMessage = 'Kunne ikke kontakte serveren. Sjekk internetttilkoblingen.';
      }
      
      setError(errorMessage);
      setBedrifter([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer og sorter bedrifter
  const filtrerteBedrifter = bedrifter
    .filter(b => !sok || b.navn.toLowerCase().includes(sok.toLowerCase()) || 
                         b.orgNummer.includes(sok) ||
                         (b.poststed && b.poststed.toLowerCase().includes(sok.toLowerCase())))
    .sort((a, b) => {
      switch (sortBy) {
        case 'ansatte':
          return (b.ansatte?.length || 0) - (a.ansatte?.length || 0);
        case 'opprettet':
          return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime();
        default:
          return a.navn.localeCompare(b.navn);
      }
    });

  // Statistikk
  const stats = {
    totalBedrifter: bedrifter.length,
    totalAnsatte: bedrifter.reduce((sum, b) => sum + (b.ansatte?.length || 0), 0),
    medHovedbruker: bedrifter.filter(b => b.hovedbruker).length,
    medKjoretoy: bedrifter.filter(b => b.kjoretoy?.length > 0).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
                          <StatsCardSkeleton />
          <div className="mt-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#003366] mb-8">Bedrifter</h1>
          <ErrorState
            message={typeof error === 'string' ? error : error?.message || 'Ukjent feil'}
            onRetry={fetchBedrifter}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#003366] mb-2">Bedrifter</h1>
            <p className="text-gray-600">Administrer og se oversikt over alle registrerte bedrifter</p>
          </div>
          <Link 
            to="/bedrifter/wizard" 
            className="bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FaPlus /> Opprett ny bedrift
          </Link>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center cards-spacing-grid">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#003366]">{stats.totalBedrifter}</div>
                <div className="text-gray-600 text-sm">Bedrifter totalt</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center cards-spacing-grid">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#003366]">{stats.totalAnsatte}</div>
                <div className="text-gray-600 text-sm">Ansatte totalt</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center cards-spacing-grid">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUserTie className="text-purple-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#003366]">{stats.medHovedbruker}</div>
                <div className="text-gray-600 text-sm">Med hovedbruker</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center cards-spacing-grid">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-orange-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#003366]">{stats.medKjoretoy}</div>
                <div className="text-gray-600 text-sm">Med kjøretøy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Søk og Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-4">
          <div className="flex cards-spacing-grid items-center">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sok}
                onChange={e => setSok(e.target.value)}
                placeholder="Søk etter bedriftsnavn, org.nr eller poststed..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Visningsvalg */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVisning('kort')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  visning === 'kort' ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Kort-visning"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setVisning('liste')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  visning === 'liste' ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Liste-visning"
              >
                <FaThList />
              </button>
            </div>

            <button
              onClick={() => setVisFilter(!visFilter)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                visFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter /> Sorter
            </button>
            {sok && (
              <button
                onClick={() => setSok('')}
                className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <FaTimes /> Nullstill
              </button>
            )}
          </div>

          {visFilter && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-4">
                <label className="text-sm font-medium text-gray-700 mr-4">Sorter etter:</label>
                {[
                  { key: 'navn', label: 'Navn' },
                  { key: 'ansatte', label: 'Antall ansatte' },
                  { key: 'opprettet', label: 'Nyest først' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      sortBy === option.key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resultat info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Viser {filtrerteBedrifter.length} av {bedrifter.length} bedrifter
            {sok && ` som matcher "${sok}"`}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Visning:</span>
            <span className="font-medium text-[#003366]">
              {visning === 'kort' ? 'Kort' : 'Liste'}
            </span>
          </div>
        </div>

        {/* Bedrifter - Kort eller Liste */}
        {filtrerteBedrifter.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 text-center">
            <FaBuilding className="text-gray-400 text-4xl mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {sok ? 'Ingen bedrifter funnet' : 'Ingen bedrifter registrert'}
            </h3>
            <p className="text-gray-600 mb-6">
              {sok 
                ? 'Prøv å justere søkekriteriene dine'
                : 'Kom i gang ved å opprette din første bedrift'
              }
            </p>
            {!sok && (
              <Link 
                to="/bedrifter/wizard" 
                className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus /> Opprett første bedrift
              </Link>
            )}
          </div>
        ) : visning === 'kort' ? (
          /* Kort-visning */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 cards-spacing-grid">
            {filtrerteBedrifter.map((bedrift) => (
              <div key={bedrift.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="px-2 py-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#003366] mb-1">{bedrift.navn}</h3>
                      {bedrift.orgNummer && (
                        <p className="text-sm text-gray-500">Org.nr: {bedrift.orgNummer}</p>
                      )}
                    </div>
                    <Link
                      to={`/bedrifter/${bedrift.id}`}
                      className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                      title="Rediger bedrift"
                    >
                      <FaEdit />
                    </Link>
                  </div>

                  {/* Lokasjon */}
                  {(bedrift.adresse || bedrift.poststed) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        {bedrift.adresse && `${bedrift.adresse}, `}
                        {bedrift.postnummer} {bedrift.poststed}
                      </p>
                    </div>
                  )}

                  {/* Hovedbruker */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FaUserTie className="text-gray-400" />
                      <span className="text-gray-600">Hovedbruker:</span>
                      <span className="font-medium">
                        {bedrift.hovedbruker?.navn || 'Ikke satt'}
                      </span>
                    </div>
                  </div>

                  {/* Statistikk */}
                  <div className="grid grid-cols-2 cards-spacing-grid mb-3">
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-xl font-bold text-[#003366]">{bedrift.ansatte?.length || 0}</div>
                      <div className="text-xs text-gray-600">Ansatte</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-xl font-bold text-[#003366]">{bedrift.kjoretoy?.length || 0}</div>
                      <div className="text-xs text-gray-600">Kjøretøy</div>
                    </div>
                  </div>

                  {/* Se detaljer link */}
                  <Link
                    to={`/bedrifter/${bedrift.id}`}
                    className="flex items-center justify-between w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-[#003366]"
                  >
                    <span>Se bedriftsdetaljer</span>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Liste-visning */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-1 px-2 font-semibold text-gray-700">Bedrift</th>
                    <th className="text-left py-1 px-2 font-semibold text-gray-700">Lokasjon</th>
                    <th className="text-left py-1 px-2 font-semibold text-gray-700">Hovedbruker</th>
                    <th className="text-center py-1 px-2 font-semibold text-gray-700">Ansatte</th>
                    <th className="text-center py-1 px-2 font-semibold text-gray-700">Kjøretøy</th>
                    <th className="text-center py-1 px-2 font-semibold text-gray-700">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrerteBedrifter.map((bedrift) => (
                    <tr key={bedrift.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-1 px-2">
                        <div>
                          <div className="font-semibold text-[#003366]">{bedrift.navn}</div>
                          {bedrift.orgNummer && (
                            <div className="text-sm text-gray-500">Org.nr: {bedrift.orgNummer}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-1 px-2">
                        <div className="text-sm text-gray-600">
                          {bedrift.adresse && (
                            <div>{bedrift.adresse}</div>
                          )}
                          {(bedrift.postnummer || bedrift.poststed) && (
                            <div>{bedrift.postnummer} {bedrift.poststed}</div>
                          )}
                          {!bedrift.adresse && !bedrift.postnummer && !bedrift.poststed && (
                            <span className="text-gray-400">Ikke oppgitt</span>
                          )}
                        </div>
                      </td>
                      <td className="py-1 px-2">
                        <div className="text-sm">
                          {bedrift.hovedbruker ? (
                            <>
                              <div className="font-medium text-gray-900">{bedrift.hovedbruker.navn}</div>
                              <div className="text-gray-500">{bedrift.hovedbruker.epost}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">Ikke satt</span>
                          )}
                        </div>
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          {bedrift.ansatte?.length || 0}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {bedrift.kjoretoy?.length || 0}
                        </span>
                      </td>
                      <td className="py-1 px-2">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/bedrifter/${bedrift.id}`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-2 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            <FaEdit size={12} /> Rediger
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
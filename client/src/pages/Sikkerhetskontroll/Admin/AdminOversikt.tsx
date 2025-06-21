import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaList, FaArrowLeft, FaChartBar, FaCog, FaClipboardList, FaBookOpen } from 'react-icons/fa';
import sikkerhetskontrollService, { SikkerhetskontrollDashboardData } from '../../../services/sikkerhetskontroll.service';

const AdminOversikt: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SikkerhetskontrollDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hentDashboardData = async () => {
      try {
        const data = await sikkerhetskontrollService.hentDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Feil ved henting av sikkerhetskontroll dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    hentDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickStats = dashboardData?.quickStats || {
    totaleSjekkpunkter: 0,
    a1Sjekkpunkter: 0,
    forskjelligeSystemer: 0
  };

  return (
    <div className="px-2 py-1 bg-white min-h-screen">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#003366] hover:underline font-semibold mb-4">
          <FaArrowLeft /> Tilbake
        </Link>
        <h1 className="text-3xl font-bold text-[#003366]">Sikkerhetskontroll</h1>
        <p className="text-gray-600 mt-2">Administrer sjekkpunkter og sikkerhetskontroller</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaList className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#003366]">Sjekkpunkt-bibliotek</h3>
              <p className="text-sm text-gray-500">Se og administrer alle sjekkpunkter</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Søk, filtrer og rediger eksisterende sjekkpunkter. Se alle kontrollpunkter som er tilgjengelige for forskjellige kjøretøytyper.
          </p>
          <Link
            to="/sikkerhetskontroll/sjekkpunktbibliotek"
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-2 py-1 rounded-lg hover:bg-blue-900 transition-colors w-full justify-center"
          >
            <FaList /> Åpne bibliotek
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaBookOpen className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#003366]">Liste bibliotek</h3>
              <p className="text-sm text-gray-500">Globale maler for kontroller</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Se og ta i bruk forhåndsdefinerte kontrollmaler som kan kopieres til din bedrift. Perfekt for standardiserte kontroller.
          </p>
          <Link
            to="/sikkerhetskontroll/liste-bibliotek"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center"
          >
            <FaBookOpen /> Se maler
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaPlus className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#003366]">Opprett sjekkpunkt</h3>
              <p className="text-sm text-gray-500">Definer nytt kontrollpunkt</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Lag nye sjekkpunkter med detaljerte instruksjoner, konsekvenser og intervaller for forskjellige kjøretøytyper.
          </p>
          <Link
            to="/sikkerhetskontroll/opprett-sjekkpunkt"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
          >
            <FaPlus /> Opprett nytt
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCog className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#003366]">Opprett kontroll</h3>
              <p className="text-sm text-gray-500">Lag sikkerhetskontroll</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Velg sjekkpunkter fra biblioteket og opprett en kontroll som elever eller lærere kan gjennomføre.
          </p>
          <Link
            to="/sikkerhetskontroll/opprett-kontroll"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors w-full justify-center"
          >
            <FaCog /> Opprett kontroll
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 hover:shadow-md transition-shadow">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-orange-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#003366]">Kontroller-oversikt</h3>
              <p className="text-sm text-gray-500">Se alle opprettede kontroller</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Få oversikt over alle sikkerhetskontroller som er opprettet, rediger eller slett eksisterende kontroller.
          </p>
          <Link
            to="/sikkerhetskontroll/kontroller"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-2 py-1 rounded-lg hover:bg-orange-700 transition-colors w-full justify-center"
          >
            <FaClipboardList /> Se kontroller
          </Link>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 px-2 py-1">
          <div className="flex items-center cards-spacing-grid mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-gray-400 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-500">Statistikk & Rapporter</h3>
              <p className="text-sm text-gray-400">Kommer snart</p>
            </div>
          </div>
          <p className="text-gray-500 mb-4 text-sm">
            Få oversikt over gjennomførte kontroller, statistikk og trender i sikkerhetskontrollene.
          </p>
          <button
            disabled
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-400 px-2 py-1 rounded-lg w-full justify-center cursor-not-allowed"
          >
            <FaChartBar /> Kommer snart
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 px-2 py-1">
        <h2 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <FaCog className="text-blue-600" />
          Hurtiginfo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{quickStats.totaleSjekkpunkter}</div>
            <div className="text-blue-600">Totale sjekkpunkter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{quickStats.a1Sjekkpunkter}</div>
            <div className="text-green-600">A1-sjekkpunkter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{quickStats.forskjelligeSystemer}</div>
            <div className="text-purple-600">Forskjellige systemer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOversikt; 
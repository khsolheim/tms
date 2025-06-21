import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { elevService, type ElevProfil, type Fremgang } from '../../services/elev.service';
import {
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  EyeIcon,
  TrophyIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon
} from '@heroicons/react/24/solid';
import ElevKommunikasjon from './ElevKommunikasjon';

export default function ElevProfilPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'profil' | 'fremgang' | 'timer' | 'prøver' | 'dokumenter' | 'kommunikasjon'>('profil');
  const [elev, setElev] = useState<ElevProfil | null>(null);
  const [fremgang, setFremgang] = useState<Fremgang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hentElevData = async () => {
      if (!id) {
        setError('Elev ID mangler');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [elevData, fremgangData] = await Promise.all([
          elevService.hentElev(id),
          elevService.hentElevFremgang(id)
        ]);
        
        if (!elevData) {
          setError('Elev ikke funnet');
        } else {
          setElev(elevData);
          setFremgang(fremgangData);
          setError(null);
        }
      } catch (err) {
        console.error('Feil ved henting av elevdata:', err);
        setError('Kunne ikke hente elevdata');
      } finally {
        setLoading(false);
      }
    };

    hentElevData();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'bg-green-100 text-green-800';
      case 'fullført': return 'bg-blue-100 text-blue-800';
      case 'pause': return 'bg-yellow-100 text-yellow-800';
      case 'inaktiv': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aktiv': return 'Aktiv';
      case 'fullført': return 'Fullført';
      case 'pause': return 'Pause';
      case 'inaktiv': return 'Inaktiv';
      default: return status;
    }
  };

  const getFremgangColor = (status: string) => {
    switch (status) {
      case 'fullført': return 'bg-green-500';
      case 'pågår': return 'bg-blue-500';
      case 'ikke_startet': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getFremgangText = (status: string) => {
    switch (status) {
      case 'fullført': return 'Fullført';
      case 'pågår': return 'Pågår';
      case 'ikke_startet': return 'Ikke startet';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Laster elevprofil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <Link 
          to="/elever" 
          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Tilbake til elevoversikt
        </Link>
      </div>
    );
  }

  if (!elev) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800">Elev ikke funnet</div>
        <Link 
          to="/elever" 
          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Tilbake til elevoversikt
        </Link>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link 
                to="/elever" 
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {elev.fornavn} {elev.etternavn}
                </h1>
                <p className="text-sm text-gray-600">
                  Opprettet: {new Date(elev.opprettDato).toLocaleDateString('nb-NO')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(elev.status)}`}>
                {getStatusText(elev.status)}
              </span>
              <Link
                to={`/elever/${elev.id}/rediger`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaEdit /> Rediger
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* Personlig informasjon */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Personlig informasjon</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Personnummer</p>
                    <p className="text-sm font-medium text-gray-900">{elev.personnummer}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="text-sm font-medium text-gray-900">{elev.telefon}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">E-post</p>
                    <p className="text-sm font-medium text-gray-900">{elev.epost}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-sm font-medium text-gray-900">
                      {elev.adresse.gate}<br />
                      {elev.adresse.postnummer} {elev.adresse.poststed}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Bedrift</p>
                    <p className="text-sm font-medium text-gray-900">{elev.bedrift.navn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instruktør</p>
                    <p className="text-sm font-medium text-gray-900">{elev.instruktør.navn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Førerkortklass</p>
                    <p className="text-sm font-medium text-gray-900">
                      {elev.førerkortklass.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistikk */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Statistikk</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Timer fullført</span>
                  <span className="font-medium">{elev.statistikk.gjennomførteTimer} / {elev.statistikk.totalTimer}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(elev.statistikk.gjennomførteTimer / elev.statistikk.totalTimer) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prøver bestått</span>
                  <span className="font-medium">{elev.statistikk.beståttePrøver} / {elev.statistikk.totaltPrøver}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(elev.statistikk.beståttePrøver / elev.statistikk.totaltPrøver) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{elev.statistikk.gjennomsnittKarakter.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">Gjennomsnittkarakter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fremgang */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fremgang</h2>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            {fremgang.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${getFremgangColor(item.status)} mr-4`}></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.kategori}</h3>
                    <p className="text-sm text-gray-500">{item.beskrivelse}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{item.prosent}%</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'fullført' ? 'bg-green-100 text-green-800' :
                      item.status === 'pågår' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getFremgangText(item.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sist oppdatert: {new Date(item.sistOppdatert).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </div>
            ))}
            {fremgang.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Ingen fremgangsdata registrert
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
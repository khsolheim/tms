import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface SponsorFormData {
  navn: string;
  bedriftId: number;
  type: 'SPONSOR';
  kontaktperson: string;
  telefon: string;
  epost: string;
  nettside: string;
  startDato: string;
  sluttDato: string;
  budsjett: number;
  kostnadPerVisning: number;
  kostnadPerKlikk: number;
}

interface Bedrift {
  id: number;
  navn: string;
}

export default function AnnonsorSponsorForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bedrifter, setBedrifter] = useState<Bedrift[]>([]);
  const [formData, setFormData] = useState<SponsorFormData>({
    navn: '',
    bedriftId: 0,
    type: 'SPONSOR',
    kontaktperson: '',
    telefon: '',
    epost: '',
    nettside: '',
    startDato: new Date().toISOString().split('T')[0],
    sluttDato: '',
    budsjett: 0,
    kostnadPerVisning: 0,
    kostnadPerKlikk: 0
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    fetchBedrifter();
    if (isEditing) {
      fetchSponsor();
    }
  }, [id]);

  const fetchBedrifter = async () => {
    try {
      const response = await fetch('/api/bedrifter', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente bedrifter');
      }

      const data = await response.json();
      setBedrifter(data);
    } catch (error) {
      console.error('Feil ved henting av bedrifter:', error);
      toast.error('Kunne ikke hente bedrifter');
    }
  };

  const fetchSponsor = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annonsor/sponsorer/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente sponsor');
      }

      const data = await response.json();
      setFormData({
        navn: data.navn || '',
        bedriftId: data.bedriftId || 0,
        type: 'SPONSOR',
        kontaktperson: data.kontaktperson || '',
        telefon: data.telefon || '',
        epost: data.epost || '',
        nettside: data.nettside || '',
        startDato: data.startDato ? new Date(data.startDato).toISOString().split('T')[0] : '',
        sluttDato: data.sluttDato ? new Date(data.sluttDato).toISOString().split('T')[0] : '',
        budsjett: data.budsjett || 0,
        kostnadPerVisning: data.kostnadPerVisning || 0,
        kostnadPerKlikk: data.kostnadPerKlikk || 0
      });
    } catch (error) {
      console.error('Feil ved henting av sponsor:', error);
      toast.error('Kunne ikke hente sponsor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.navn || !formData.bedriftId || !formData.startDato) {
      toast.error('Vennligst fyll ut alle påkrevde felter');
      return;
    }

    try {
      setLoading(true);
      const url = isEditing 
        ? `/api/annonsor/sponsorer/${id}`
        : '/api/annonsor/sponsorer';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Kunne ikke lagre sponsor');
      }

      toast.success(`Sponsor ${isEditing ? 'oppdatert' : 'opprettet'} successfully`);
      navigate('/admin/annonsor/sponsorer');
    } catch (error) {
      console.error('Feil ved lagring av sponsor:', error);
      toast.error('Kunne ikke lagre sponsor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : 0
    }));
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laster sponsor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/annonsor/sponsorer')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Rediger Sponsor' : 'Ny Sponsor'}
                </h1>
                <p className="text-lg text-gray-600">
                  {isEditing ? 'Oppdater sponsorinformasjon' : 'Opprett en ny sponsor'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Grunnleggende informasjon
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="navn" className="block text-sm font-medium text-gray-700 mb-2">
                    Sponsor navn *
                  </label>
                  <input
                    type="text"
                    id="navn"
                    name="navn"
                    value={formData.navn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Skriv sponsor navn"
                  />
                </div>

                <div>
                  <label htmlFor="bedriftId" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrift *
                  </label>
                  <select
                    id="bedriftId"
                    name="bedriftId"
                    value={formData.bedriftId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Velg bedrift</option>
                    {bedrifter.map(bedrift => (
                      <option key={bedrift.id} value={bedrift.id}>
                        {bedrift.navn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Kontaktinformasjon
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="kontaktperson" className="block text-sm font-medium text-gray-700 mb-2">
                    Kontaktperson
                  </label>
                  <input
                    type="text"
                    id="kontaktperson"
                    name="kontaktperson"
                    value={formData.kontaktperson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Navn på kontaktperson"
                  />
                </div>

                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Telefonnummer"
                  />
                </div>

                <div>
                  <label htmlFor="epost" className="block text-sm font-medium text-gray-700 mb-2">
                    E-post
                  </label>
                  <input
                    type="email"
                    id="epost"
                    name="epost"
                    value={formData.epost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="E-postadresse"
                  />
                </div>

                <div>
                  <label htmlFor="nettside" className="block text-sm font-medium text-gray-700 mb-2">
                    Nettside
                  </label>
                  <input
                    type="url"
                    id="nettside"
                    name="nettside"
                    value={formData.nettside}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Period and Budget */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Periode og budsjett
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDato" className="block text-sm font-medium text-gray-700 mb-2">
                    Startdato *
                  </label>
                  <input
                    type="date"
                    id="startDato"
                    name="startDato"
                    value={formData.startDato}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="sluttDato" className="block text-sm font-medium text-gray-700 mb-2">
                    Sluttdato
                  </label>
                  <input
                    type="date"
                    id="sluttDato"
                    name="sluttDato"
                    value={formData.sluttDato}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="budsjett" className="block text-sm font-medium text-gray-700 mb-2">
                    Budsjett (NOK)
                  </label>
                  <input
                    type="number"
                    id="budsjett"
                    name="budsjett"
                    value={formData.budsjett}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="kostnadPerVisning" className="block text-sm font-medium text-gray-700 mb-2">
                    Kostnad per visning (NOK)
                  </label>
                  <input
                    type="number"
                    id="kostnadPerVisning"
                    name="kostnadPerVisning"
                    value={formData.kostnadPerVisning}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="kostnadPerKlikk" className="block text-sm font-medium text-gray-700 mb-2">
                    Kostnad per klikk (NOK)
                  </label>
                  <input
                    type="number"
                    id="kostnadPerKlikk"
                    name="kostnadPerKlikk"
                    value={formData.kostnadPerKlikk}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/annonsor/sponsorer')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Avbryt
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Lagrer...' : (isEditing ? 'Oppdater Sponsor' : 'Opprett Sponsor')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom'; // Not used
import { FiHome, FiSave, FiAlertCircle, FiPhone, FiMapPin, FiFileText, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../contexts';

interface BedriftData {
  navn: string;
  organisasjonsnummer: string;
  telefon: string;
  epost: string;
  adresse: string;
  postnummer: string;
  poststed: string;
  fakturaAdresse: string;
  fakturaPostnummer: string;
  fakturaPoststed: string;
  kontaktperson: string;
  kontaktpersonTelefon: string;
  kontaktpersonEpost: string;
  hjemmeside: string;
  beskrivelse: string;
}

export default function Bedriftsinnstillinger() {
  const { bruker } = useAuth();
  const [bedriftData, setBedriftData] = useState<BedriftData>({
    navn: '',
    organisasjonsnummer: '',
    telefon: '',
    epost: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    fakturaAdresse: '',
    fakturaPostnummer: '',
    fakturaPoststed: '',
    kontaktperson: '',
    kontaktpersonTelefon: '',
    kontaktpersonEpost: '',
    hjemmeside: '',
    beskrivelse: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [sammeAdresse, setSammeAdresse] = useState(false);

  useEffect(() => {
    hentBedriftData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sammeAdresse) {
      setBedriftData(prev => ({
        ...prev,
        fakturaAdresse: prev.adresse,
        fakturaPostnummer: prev.postnummer,
        fakturaPoststed: prev.poststed
      }));
    }
  }, [sammeAdresse, bedriftData.adresse, bedriftData.postnummer, bedriftData.poststed]);

  const hentBedriftData = async () => {
    try {
      const response = await api.get(`/bedrifter/${bruker?.bedrift}`);
      const data = response.data;
      
      const bedriftInfo: BedriftData = {
        navn: data.navn || '',
        organisasjonsnummer: data.organisasjonsnummer || '',
        telefon: data.telefon || '',
        epost: data.epost || '',
        adresse: data.adresse || '',
        postnummer: data.postnummer || '',
        poststed: data.poststed || '',
        fakturaAdresse: data.fakturaAdresse || '',
        fakturaPostnummer: data.fakturaPostnummer || '',
        fakturaPoststed: data.fakturaPoststed || '',
        kontaktperson: data.kontaktperson || '',
        kontaktpersonTelefon: data.kontaktpersonTelefon || '',
        kontaktpersonEpost: data.kontaktpersonEpost || '',
        hjemmeside: data.hjemmeside || '',
        beskrivelse: data.beskrivelse || ''
      };
      
      setBedriftData(bedriftInfo);
      
      // Sjekk om fakturaadresse er samme som besøksadresse
      setSammeAdresse(
        bedriftInfo.fakturaAdresse === bedriftInfo.adresse &&
        bedriftInfo.fakturaPostnummer === bedriftInfo.postnummer &&
        bedriftInfo.fakturaPoststed === bedriftInfo.poststed
      );
    } catch (error) {
      toast.error('Kunne ikke hente bedriftsdata');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BedriftData, value: string) => {
    setBedriftData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const validerOrganisasjonsnummer = (orgnr: string): boolean => {
    // Norsk organisasjonsnummer: 9 siffer, siste siffer er kontrollsiffer
    const cleanNumber = orgnr.replace(/\s/g, '');
    if (cleanNumber.length !== 9 || !/^\d+$/.test(cleanNumber)) return false;
    
    // Mod11 validering
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      sum += parseInt(cleanNumber[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return checkDigit === parseInt(cleanNumber[8]);
  };

  const formaterOrganisasjonsnummer = (value: string): string => {
    const cleanNumber = value.replace(/\s/g, '');
    if (cleanNumber.length <= 3) return cleanNumber;
    if (cleanNumber.length <= 6) return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3)}`;
    return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6, 9)}`;
  };

  const formaterTelefon = (value: string): string => {
    const cleanNumber = value.replace(/[\s+]/g, '');
    if (cleanNumber.length <= 3) return cleanNumber;
    if (cleanNumber.length <= 5) return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3)}`;
    return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 5)} ${cleanNumber.slice(5, 8)}`;
  };

  const lagreBedriftData = async () => {
    // Valider organisasjonsnummer
    if (bedriftData.organisasjonsnummer && !validerOrganisasjonsnummer(bedriftData.organisasjonsnummer)) {
      toast.error('Ugyldig organisasjonsnummer');
      return;
    }

    // Valider e-postadresser
    const epostRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bedriftData.epost && !epostRegex.test(bedriftData.epost)) {
      toast.error('Ugyldig e-postadresse');
      return;
    }
    if (bedriftData.kontaktpersonEpost && !epostRegex.test(bedriftData.kontaktpersonEpost)) {
      toast.error('Ugyldig e-postadresse for kontaktperson');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/bedrifter/${bruker?.bedrift}`, bedriftData);
      toast.success('Bedriftsdata lagret');
      setHasChanges(false);
    } catch (error) {
      toast.error('Kunne ikke lagre bedriftsdata');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <FiHome className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Bedriftsinnstillinger</h2>
          </div>
        </div>

        <div className="px-2 py-1 cards-spacing-vertical">
          {/* Grunnleggende informasjon */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiFileText className="w-5 h-5 mr-2 text-gray-600" />
              Grunnleggende informasjon
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedriftsnavn
                </label>
                <input
                  type="text"
                  value={bedriftData.navn}
                  onChange={(e) => handleChange('navn', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organisasjonsnummer
                </label>
                <input
                  type="text"
                  value={bedriftData.organisasjonsnummer}
                  onChange={(e) => {
                    const formatted = formaterOrganisasjonsnummer(e.target.value);
                    if (formatted.replace(/\s/g, '').length <= 9) {
                      handleChange('organisasjonsnummer', formatted);
                    }
                  }}
                  placeholder="123 456 789"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    bedriftData.organisasjonsnummer && !validerOrganisasjonsnummer(bedriftData.organisasjonsnummer) 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                />
                {bedriftData.organisasjonsnummer && !validerOrganisasjonsnummer(bedriftData.organisasjonsnummer) && (
                  <p className="text-xs text-red-600 mt-1">Ugyldig organisasjonsnummer</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivelse
                </label>
                <textarea
                  value={bedriftData.beskrivelse}
                  onChange={(e) => handleChange('beskrivelse', e.target.value)}
                  placeholder="Kort beskrivelse av bedriften..."
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Kontaktinformasjon */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiPhone className="w-5 h-5 mr-2 text-gray-600" />
              Kontaktinformasjon
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={bedriftData.telefon}
                  onChange={(e) => handleChange('telefon', formaterTelefon(e.target.value))}
                  placeholder="123 45 678"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={bedriftData.epost}
                  onChange={(e) => handleChange('epost', e.target.value)}
                  placeholder="post@bedrift.no"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hjemmeside
                </label>
                <input
                  type="url"
                  value={bedriftData.hjemmeside}
                  onChange={(e) => handleChange('hjemmeside', e.target.value)}
                  placeholder="https://www.bedrift.no"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Besøksadresse */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-gray-600" />
              Besøksadresse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateadresse
                </label>
                <input
                  type="text"
                  value={bedriftData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  placeholder="Gatenavn og nummer"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postnummer
                </label>
                <input
                  type="text"
                  value={bedriftData.postnummer}
                  onChange={(e) => handleChange('postnummer', e.target.value)}
                  placeholder="0000"
                  maxLength={4}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poststed
                </label>
                <input
                  type="text"
                  value={bedriftData.poststed}
                  onChange={(e) => handleChange('poststed', e.target.value)}
                  placeholder="Poststed"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Fakturaadresse */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiFileText className="w-5 h-5 mr-2 text-gray-600" />
              Fakturaadresse
            </h3>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sammeAdresse}
                  onChange={(e) => setSammeAdresse(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Samme som besøksadresse</span>
              </label>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${sammeAdresse ? 'opacity-50' : ''}`}>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateadresse
                </label>
                <input
                  type="text"
                  value={bedriftData.fakturaAdresse}
                  onChange={(e) => handleChange('fakturaAdresse', e.target.value)}
                  placeholder="Gatenavn og nummer"
                  disabled={sammeAdresse}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postnummer
                </label>
                <input
                  type="text"
                  value={bedriftData.fakturaPostnummer}
                  onChange={(e) => handleChange('fakturaPostnummer', e.target.value)}
                  placeholder="0000"
                  maxLength={4}
                  disabled={sammeAdresse}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poststed
                </label>
                <input
                  type="text"
                  value={bedriftData.fakturaPoststed}
                  onChange={(e) => handleChange('fakturaPoststed', e.target.value)}
                  placeholder="Poststed"
                  disabled={sammeAdresse}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Kontaktperson */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2 text-gray-600" />
              Kontaktperson
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Navn
                </label>
                <input
                  type="text"
                  value={bedriftData.kontaktperson}
                  onChange={(e) => handleChange('kontaktperson', e.target.value)}
                  placeholder="Fornavn Etternavn"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={bedriftData.kontaktpersonTelefon}
                  onChange={(e) => handleChange('kontaktpersonTelefon', formaterTelefon(e.target.value))}
                  placeholder="123 45 678"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={bedriftData.kontaktpersonEpost}
                  onChange={(e) => handleChange('kontaktpersonEpost', e.target.value)}
                  placeholder="navn@bedrift.no"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lagre-knapp */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {hasChanges && (
                  <span className="text-orange-600">
                    <FiAlertCircle className="inline w-4 h-4 mr-1" />
                    Du har ulagrede endringer
                  </span>
                )}
              </div>
              
              <button
                onClick={lagreBedriftData}
                disabled={!hasChanges || saving || (bedriftData.organisasjonsnummer ? !validerOrganisasjonsnummer(bedriftData.organisasjonsnummer) : false)}
                className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Lagrer...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Lagre endringer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
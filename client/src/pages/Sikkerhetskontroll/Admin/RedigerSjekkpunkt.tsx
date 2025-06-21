import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaMinus, 
  FaInfoCircle, 
  FaCog, 
  FaImage, 
  FaUsers, 
  FaCar,
  FaExclamationTriangle 
} from 'react-icons/fa';
import MDEditor from '@uiw/react-md-editor';
import api from '../../../lib/api';

const systemer = [
  'Bremser',
  'Dekk',
  'Styring',
  'Lys',
  'Drivverk',
  'Annet',
];

const kjøretøytyper = [
  'Personbil',
  'Lastebil',
  'Buss',
  'Varebil',
  'Motorsykkel',
  'Moped',
  'Traktor',
  'Annet'
];

const kjøretøymerker = [
  'Toyota', 'Volvo', 'Mercedes', 'BMW', 'Audi', 'Ford', 'Volkswagen', 
  'Scania', 'MAN', 'Iveco', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Annet'
];

interface Klasse {
  kode: string;
  omfatter: string;
  alder: string;
}

// Flytt SectionCard utenfor hovedkomponenten for å unngå re-rendering
const SectionCard = ({ icon: Icon, title, children, className = "" }: {
  icon: any;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    <div className="bg-gray-50 px-2 py-1 border-b border-gray-200 rounded-t-lg">
      <div className="flex items-center cards-spacing-grid">
        <Icon className="text-[#003366] text-lg" />
        <h3 className="text-lg font-semibold text-[#003366]">{title}</h3>
      </div>
    </div>
    <div className="px-2 py-1">
      {children}
    </div>
  </div>
);

const RedigerSjekkpunkt: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    tittel: '',
    beskrivelse: '',
    bilde: undefined as File | undefined,
    video: undefined as File | undefined,
    konsekvenser: [''],
    rettVerdi: '',
    typeKontroll: 'FYSISK',
    system: '',
    intervallKm: '',
    intervallTid: '',
    forerkortklass: [] as string[],
    unikForType: false,
    unikForMerke: false,
    unikForRegnr: false,
    kjoretoytype: '',
    kjoretoymerke: '',
    kjoretoyRegNr: ''
  });

  const [klasser, setKlasser] = useState<Klasse[]>([]);
  const [lasterKlasser, setLasterKlasser] = useState(true);
  const [lasterSjekkpunkt, setLasterSjekkpunkt] = useState(true);
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    const hentKlasser = async () => {
      try {
        const res = await api.get('/klasser');
        setKlasser(res.data);
      } catch (error) {
        console.error('Feil ved henting av klasser:', error);
      } finally {
        setLasterKlasser(false);
      }
    };

    const hentSjekkpunkt = async () => {
      if (!id) return;
      
      try {
        setLasterSjekkpunkt(true);
        const res = await api.get(`/sjekkpunkt`);
        const sjekkpunkt = res.data.find((s: any) => s.id === Number(id));
        
        if (sjekkpunkt) {
          setForm({
            tittel: sjekkpunkt.tittel || '',
            beskrivelse: sjekkpunkt.beskrivelse || '',
            bilde: undefined,
            video: undefined,
            konsekvenser: sjekkpunkt.konsekvens?.length > 0 ? sjekkpunkt.konsekvens : [''],
            rettVerdi: sjekkpunkt.rettVerdi || '',
            typeKontroll: sjekkpunkt.typeKontroll || 'FYSISK',
            system: sjekkpunkt.system || '',
            intervallKm: sjekkpunkt.intervallKm?.toString() || '',
            intervallTid: sjekkpunkt.intervallTid?.toString() || '',
            forerkortklass: sjekkpunkt.forerkortklass || [],
            unikForType: sjekkpunkt.unikForType || false,
            unikForMerke: sjekkpunkt.unikForMerke || false,
            unikForRegnr: sjekkpunkt.unikForRegnr || false,
            kjoretoytype: sjekkpunkt.kjoretoytype || '',
            kjoretoymerke: sjekkpunkt.kjoretoymerke || '',
            kjoretoyRegNr: sjekkpunkt.kjoretoyRegNr || ''
          });
        } else {
          setFeil('Sjekkpunkt ikke funnet');
        }
      } catch (error: any) {
        console.error('Feil ved henting av sjekkpunkt:', error);
        setFeil(error.response?.data?.error || 'Kunne ikke hente sjekkpunkt');
      } finally {
        setLasterSjekkpunkt(false);
      }
    };

    hentKlasser();
    hentSjekkpunkt();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files, type, checked } = e.target as any;
    
    if (type === 'checkbox') {
      setForm(f => ({
        ...f,
        [name]: checked,
      }));
    } else if (files) {
      setForm(f => ({
        ...f,
        [name]: files[0],
      }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const handleKlasseChange = (klassekode: string, checked: boolean) => {
    setForm(f => ({
      ...f,
      forerkortklass: checked 
        ? [...f.forerkortklass, klassekode]
        : f.forerkortklass.filter(k => k !== klassekode)
    }));
  };

  const leggTilKonsekvens = () => {
    setForm(f => ({
      ...f,
      konsekvenser: [...f.konsekvenser, '']
    }));
  };

  const fjernKonsekvens = (index: number) => {
    setForm(f => ({
      ...f,
      konsekvenser: f.konsekvenser.filter((_, i) => i !== index)
    }));
  };

  const oppdaterKonsekvens = (index: number, value: string) => {
    setForm(f => ({
      ...f,
      konsekvenser: f.konsekvenser.map((k, i) => i === index ? value : k)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLagrer(true);
    setFeil(null);

    try {
      // Prepare data for API
      const sjekkpunktData = {
        tittel: form.tittel,
        beskrivelse: form.beskrivelse,
        konsekvens: form.konsekvenser.filter(k => k.trim() !== ''),
        rettVerdi: form.rettVerdi || null,
        typeKontroll: form.typeKontroll,
        system: form.system,
        intervallKm: form.intervallKm ? Number(form.intervallKm) : null,
        intervallTid: form.intervallTid ? Number(form.intervallTid) : null,
        forerkortklass: form.forerkortklass,
        unikForType: form.unikForType,
        unikForMerke: form.unikForMerke,
        unikForRegnr: form.unikForRegnr,
        kjoretoytype: form.unikForType ? form.kjoretoytype : null,
        kjoretoymerke: form.unikForMerke ? form.kjoretoymerke : null,
        kjoretoyRegNr: form.unikForRegnr ? form.kjoretoyRegNr : null
      };

      await api.put(`/sjekkpunkt/${id}`, sjekkpunktData);
      
      // Navigate back to bibliotek on success
      navigate('/sikkerhetskontroll/sjekkpunktbibliotek');
      
    } catch (error: any) {
      console.error('Feil ved oppdatering av sjekkpunkt:', error);
      setFeil(error.response?.data?.error || 'Kunne ikke oppdatere sjekkpunkt');
    } finally {
      setLagrer(false);
    }
  };

  if (lasterSjekkpunkt) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laster sjekkpunkt...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-2 py-1">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/sikkerhetskontroll/sjekkpunktbibliotek" 
            className="inline-flex items-center gap-2 text-[#003366] hover:underline font-semibold mb-4"
          >
            <FaArrowLeft /> Tilbake til bibliotek
          </Link>
          <h1 className="text-3xl font-bold text-[#003366]">Rediger sjekkpunkt</h1>
          <p className="text-gray-600 mt-2">Oppdater informasjon for dette sjekkpunktet</p>
        </div>

        <form onSubmit={handleSubmit} className="cards-spacing-vertical">
          {/* 1. GRUNNLEGGENDE INFORMASJON */}
          <SectionCard icon={FaInfoCircle} title="Grunnleggende informasjon">
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div className="lg:col-span-2">
                <label className="block font-semibold mb-2 text-gray-700">
                  Hva skal sjekkes? *
                </label>
                <input 
                  name="tittel" 
                  value={form.tittel} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. Kontroller dekktrykk på alle hjul"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block font-semibold mb-2 text-gray-700">
                  Detaljert beskrivelse av hvordan kontrollen utføres *
                </label>
                <div data-color-mode="light">
                  <MDEditor
                    value={form.beskrivelse}
                    onChange={(val) => setForm(f => ({ ...f, beskrivelse: val || '' }))}
                    preview="edit"
                    hideToolbar={false}
                    height={180}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Bruk formatering for å lage lister, fremheve viktige punkter, etc.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Type kontroll *</label>
                <select 
                  name="typeKontroll" 
                  value={form.typeKontroll} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                >
                  <option value="FYSISK">Fysisk kontroll</option>
                  <option value="VISUELL">Visuell kontroll</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">System/komponent *</label>
                <select 
                  name="system" 
                  value={form.system} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                >
                  <option value="">Velg system...</option>
                  {systemer.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* 2. TEKNISKE SPESIFIKASJONER */}
          <SectionCard icon={FaCog} title="Tekniske spesifikasjoner">
            <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Rett verdi/akseptabel område
                </label>
                <input 
                  name="rettVerdi" 
                  value={form.rettVerdi} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. 2.0-2.5 bar, Mellom MIN/MAX"
                />
                <p className="text-sm text-gray-500 mt-1">Spesifiser målverdier eller akseptabelt område</p>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Kontrollintervall (km)</label>
                <input 
                  name="intervallKm" 
                  type="number" 
                  value={form.intervallKm} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. 5000"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Kontrollintervall (dager)</label>
                <input 
                  name="intervallTid" 
                  type="number" 
                  value={form.intervallTid} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                  placeholder="F.eks. 90"
                />
              </div>
            </div>
          </SectionCard>

          {/* 3. MULTIMEDIA */}
          <SectionCard icon={FaImage} title="Bilder og videoer">
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Oppdater instruksjonsbilde</label>
                <input 
                  type="file" 
                  name="bilde" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                />
                <p className="text-sm text-gray-500 mt-1">Last opp nytt bilde hvis du vil endre det eksisterende</p>
              </div>
              
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Oppdater instruksjonsvideo</label>
                <input 
                  type="file" 
                  name="video" 
                  accept="video/*" 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                />
                <p className="text-sm text-gray-500 mt-1">Last opp ny video hvis du vil endre den eksisterende</p>
              </div>
            </div>
          </SectionCard>

          {/* 4. GYLDIGHETSPRAMMER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
            {/* Førerkortklasser */}
            <SectionCard icon={FaUsers} title="Førerkortklasser">
              {lasterKlasser ? (
                <p className="text-gray-500">Laster tilgjengelige klasser...</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Velg hvilke førerkortklasser dette sjekkpunktet gjelder for
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {klasser.map((klasse) => (
                      <label 
                        key={klasse.kode} 
                        className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.forerkortklass.includes(klasse.kode)}
                          onChange={(e) => handleKlasseChange(klasse.kode, e.target.checked)}
                          className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                        />
                        <span className="font-semibold text-[#003366]">{klasse.kode}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            {/* Kjøretøy-spesifikt */}
            <SectionCard icon={FaCar} title="Kjøretøy-spesifikke innstillinger">
              <p className="text-sm text-gray-600 mb-4">
                Marker hvis sjekkpunktet kun gjelder for spesifikke kjøretøy
              </p>
              
              <div className="cards-spacing-vertical">
                <div className="grid grid-cols-1 cards-spacing-grid">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="unikForType"
                      checked={form.unikForType}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                    />
                    <span className="font-medium">Spesifikk kjøretøytype</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="unikForMerke"
                      checked={form.unikForMerke}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                    />
                    <span className="font-medium">Spesifikt merke</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="unikForRegnr"
                      checked={form.unikForRegnr}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                    />
                    <span className="font-medium">Spesifikt registreringsnummer</span>
                  </label>
                </div>

                {/* Betingede felt */}
                <div className="space-y-8 pt-3 border-t border-gray-200">
                  {form.unikForType && (
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">Kjøretøytype</label>
                      <select 
                        name="kjoretoytype" 
                        value={form.kjoretoytype} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      >
                        <option value="">Velg type...</option>
                        {kjøretøytyper.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {form.unikForMerke && (
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">Kjøretøymerke</label>
                      <select 
                        name="kjoretoymerke" 
                        value={form.kjoretoymerke} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      >
                        <option value="">Velg merke...</option>
                        {kjøretøymerker.map(merke => (
                          <option key={merke} value={merke}>{merke}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {form.unikForRegnr && (
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">Registreringsnummer</label>
                      <input 
                        name="kjoretoyRegNr" 
                        value={form.kjoretoyRegNr} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#003366] focus:border-transparent" 
                        placeholder="F.eks. AB 12345"
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 5. KONSEKVENSER */}
          <SectionCard icon={FaExclamationTriangle} title="Konsekvenser ved feil">
            <div className="cards-spacing-vertical">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Beskriv hva som kan skje hvis denne kontrollen ikke utføres eller feiler
                </p>
                <button 
                  type="button" 
                  onClick={leggTilKonsekvens}
                  className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaPlus /> Legg til konsekvens
                </button>
              </div>

              <div className="cards-spacing-vertical">
                {form.konsekvenser.map((konsekvens, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg px-2 py-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium text-gray-700">
                        Konsekvens {index + 1}
                      </label>
                      {form.konsekvenser.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => fjernKonsekvens(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Fjern denne konsekvensen"
                        >
                          <FaMinus />
                        </button>
                      )}
                    </div>
                    
                    <div data-color-mode="light">
                      <MDEditor
                        value={konsekvens}
                        onChange={(val) => oppdaterKonsekvens(index, val || '')}
                        preview="edit"
                        hideToolbar={false}
                        height={120}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* LAGRE-KNAPP */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            {feil && (
              <div className="flex-1 mr-4">
                <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-red-700 text-sm">
                  {feil}
                </div>
              </div>
            )}
            <div className="flex cards-spacing-grid">
              <Link
                to="/sikkerhetskontroll/sjekkpunktbibliotek"
                className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </Link>
              <button 
                type="submit" 
                disabled={lagrer}
                className="px-2 py-1 bg-[#003366] text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lagrer ? 'Oppdaterer...' : 'Oppdater sjekkpunkt'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RedigerSjekkpunkt; 
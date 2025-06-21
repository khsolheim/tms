import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFolder, FaTag, FaChevronDown, FaChevronRight, FaSearch, FaCheck } from 'react-icons/fa';
import { BildeVelger } from '../../components/forms';
import NotificationDialog from '../../components/ui/NotificationDialog';
import referenceService from '../../services/reference.service';

interface Kategori {
  id: number;
  navn: string;
  klasse: string;
  underkategorier: Kategori[];
}

interface FørerkortKlasse {
  kode: string;
  navn: string;
}

export default function OpprettSporsmal() {
  const [sporsmal, setSporsmal] = useState('');
  const [svar, setSvar] = useState(['', '', '', '']);
  const [riktigSvar, setRiktigSvar] = useState(0);
  const [valgteKlasser, setValgteKlasser] = useState<string[]>([]);
  const [kategoriId, setKategoriId] = useState('');
  const [kategorier, setKategorier] = useState<Kategori[]>([]);
  const [førerkortKlasser, setFørerkortKlasser] = useState<FørerkortKlasse[]>([]);
  const [bildeUrl, setBildeUrl] = useState('');
  const [forklaring, setForklaring] = useState('');
  const [loading, setLoading] = useState(false);
  const [visBildeVelger, setVisBildeVelger] = useState(false);
  const [utvidetKategorier, setUtvidetKategorier] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Last førerkortklasser ved oppstart
  useEffect(() => {
    hentFørerkortKlasser();
  }, []);

  // Last kategorier basert på valgte klasser
  useEffect(() => {
    if (valgteKlasser.length > 0) {
      lastKategorier();
    } else {
      setKategorier([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valgteKlasser]); // lastKategorier is intentionally excluded to avoid unnecessary re-renders

  const hentFørerkortKlasser = async () => {
    try {
      const data = await referenceService.getFørerkortKlasser();
      // Flatten the grouped data and format for this component
      const alleKlasser: FørerkortKlasse[] = [];
             Object.values(data).forEach((kategoriKlasser: any) => {
         kategoriKlasser.forEach((klasse: any) => {
          alleKlasser.push({
            kode: klasse.kode,
            navn: `${klasse.kode} - ${klasse.navn}`
          });
        });
      });
      
      // Add special classes
      alleKlasser.push({ kode: 'DROSJE', navn: 'DROSJE - Drosjesjåførsertifikat' });
      
      setFørerkortKlasser(alleKlasser.sort((a, b) => a.kode.localeCompare(b.kode)));
    } catch (error) {
      console.error('Feil ved henting av førerkortklasser:', error);
      // Fallback til hardkodet data
      setFørerkortKlasser([
        { kode: 'A1', navn: 'A1 - Lett motorsykkel' },
        { kode: 'A2', navn: 'A2 - Mellomklasse motorsykkel' },
        { kode: 'A', navn: 'A - Motorsykkel' },
        { kode: 'B', navn: 'B - Personbil' },
        { kode: 'BE', navn: 'BE - Personbil med tilhenger' },
        { kode: 'C1', navn: 'C1 - Lett lastebil' },
        { kode: 'C1E', navn: 'C1E - Lett lastebil med tilhenger' },
        { kode: 'C', navn: 'C - Lastebil' },
        { kode: 'CE', navn: 'CE - Vogntog' },
        { kode: 'D1', navn: 'D1 - Minibuss' },
        { kode: 'D1E', navn: 'D1E - Minibuss med tilhenger' },
        { kode: 'D', navn: 'D - Buss' },
        { kode: 'DE', navn: 'DE - Buss med tilhenger' },
        { kode: 'T', navn: 'T - Traktor' },
        { kode: 'S', navn: 'S - Beltemotorsykkel' },
        { kode: 'DROSJE', navn: 'DROSJE - Drosjesjåførsertifikat' }
      ]);
    }
  };

  const lastKategorier = async () => {
    setLoading(true);
    try {
      // Laste kategorier for alle valgte klasser
      const alleKategorier: Kategori[] = [];
      
      for (const klasse of valgteKlasser) {
        const response = await fetch(`/api/quiz/kategorier?klasse=${klasse}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const klasseKategorier = await response.json();
          // Legg til kategorier som ikke allerede finnes (basert på navn)
          klasseKategorier.forEach((kat: Kategori) => {
            if (!alleKategorier.find(existing => existing.navn === kat.navn)) {
              alleKategorier.push(kat);
            }
          });
        }
      }
      
      setKategorier(alleKategorier);
    } catch (error) {
      console.error('Feil ved lasting av kategorier:', error);
    }
    setLoading(false);
  };

  const toggleKlasse = (klasseKode: string) => {
    setValgteKlasser(prev => 
      prev.includes(klasseKode)
        ? prev.filter(k => k !== klasseKode)
        : [...prev, klasseKode]
    );
  };

  const toggleAlleKlasser = () => {
    if (valgteKlasser.length === førerkortKlasser.length) {
      // Hvis alle er valgt, fjern alle
      setValgteKlasser([]);
    } else {
      // Hvis ikke alle er valgt, velg alle
      setValgteKlasser(førerkortKlasser.map((k: FørerkortKlasse) => k.kode));
    }
  };

  const erAlleValgt = valgteKlasser.length === førerkortKlasser.length;
  const erNoenValgt = valgteKlasser.length > 0 && valgteKlasser.length < førerkortKlasser.length;

  const toggleKategori = (kategoriId: number) => {
    setUtvidetKategorier(prev => 
      prev.includes(kategoriId)
        ? prev.filter(id => id !== kategoriId)
        : [...prev, kategoriId]
    );
  };

  const opprettSporsmal = async () => {
    if (!sporsmal.trim() || !svar.every(s => s.trim()) || valgteKlasser.length === 0) {
      setNotification({
        isOpen: true,
        title: 'Manglende informasjon',
        message: 'Vennligst fyll ut alle obligatoriske felt',
        type: 'warning'
      });
      return;
    }

    const sporsmalData = {
      tekst: sporsmal,
      svaralternativer: svar,
      riktigSvar,
      klasser: valgteKlasser,
      kategoriId: kategoriId ? parseInt(kategoriId) : null,
      bildeUrl: bildeUrl || null,
      forklaring: forklaring || null
    };

    try {
      const response = await fetch('/api/quiz/sporsmal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sporsmalData)
      });

      if (response.ok) {
        setNotification({
          isOpen: true,
          title: 'Suksess',
          message: 'Spørsmål opprettet!',
          type: 'success'
        });
        // Reset form
        setSporsmal('');
        setSvar(['', '', '', '']);
        setRiktigSvar(0);
        setValgteKlasser([]);
        setKategoriId('');
        setBildeUrl('');
        setForklaring('');
        // Optionell: Naviger til spørsmålsbibliotek
        // navigate('/quiz/oversikt/sporsmalsbibliotek');
      } else {
        setNotification({
          isOpen: true,
          title: 'Feil',
          message: 'Feil ved oppretting av spørsmål',
          type: 'error'
        });
      }
          } catch (error) {
        console.error('Feil:', error);
        setNotification({
          isOpen: true,
          title: 'Feil',
          message: 'Feil ved oppretting av spørsmål',
          type: 'error'
        });
      }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Opprett spørsmål</h1>
      
      <div className="bg-white px-2 py-1 rounded border shadow">
        {/* Spørsmålstekst */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Spørsmål *</label>
          <textarea
            value={sporsmal}
            onChange={e => setSporsmal(e.target.value)}
            className="w-full border rounded px-2 py-1 h-24"
            placeholder="Skriv inn spørsmålsteksten..."
          />
        </div>

        {/* Illustrasjonsbilde */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Illustrasjonsbilde (valgfritt)</label>
          
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setVisBildeVelger(true)}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Velg illustrasjonsbilde
            </button>
          </div>

          {bildeUrl && (
            <div className="mb-2">
              <img src={bildeUrl} alt="Forhåndsvisning" className="max-w-xs max-h-48 object-contain border rounded" />
              <button
                type="button"
                onClick={() => setBildeUrl('')}
                className="ml-2 text-red-600 hover:text-red-800 text-sm"
              >
                Fjern bilde
              </button>
            </div>
          )}
        </div>

        {/* Svaralternativer */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Svaralternativer *</label>
          {svar.map((s, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="radio"
                name="riktig-svar"
                checked={riktigSvar === idx}
                onChange={() => setRiktigSvar(idx)}
                className="mr-2"
              />
              <input
                value={s}
                onChange={e => {
                  const nySvar = [...svar];
                  nySvar[idx] = e.target.value;
                  setSvar(nySvar);
                }}
                className="flex-1 border rounded px-2 py-1"
                placeholder={`Svaralternativ ${idx + 1}...`}
              />
            </div>
          ))}
        </div>

        {/* Forklaring */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Forklaring (valgfritt)</label>
          <textarea
            value={forklaring}
            onChange={e => setForklaring(e.target.value)}
            className="w-full border rounded px-2 py-1 h-20"
            placeholder="Forklar hvorfor svaret er riktig..."
          />
        </div>

        {/* Førerkortklasser */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Førerkortklasser *</label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={erAlleValgt}
                ref={checkbox => {
                  if (checkbox) checkbox.indeterminate = erNoenValgt;
                }}
                onChange={toggleAlleKlasser}
                className="mr-2"
              />
              Velg alle
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded px-2 py-1">
            {førerkortKlasser.map((klasse: FørerkortKlasse) => (
              <label key={klasse.kode} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={valgteKlasser.includes(klasse.kode)}
                  onChange={() => toggleKlasse(klasse.kode)}
                  className="mr-2"
                />
                {klasse.navn}
              </label>
            ))}
          </div>
          {valgteKlasser.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Valgte klasser: {valgteKlasser.join(', ')}
            </div>
          )}
        </div>

        {/* Kategori */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Kategori (valgfritt)</label>
          {loading ? (
            <div className="flex items-center justify-center px-2 py-1 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Laster kategorier...</span>
            </div>
          ) : kategorier.length > 0 ? (
            <div className="border rounded-lg bg-gray-50">
              {/* Søkefelt for kategorier */}
              <div className="px-2 py-1 border-b bg-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <FaSearch className="text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Søk i kategorier..."
                    className="flex-1 border-none outline-none text-sm"
                    onChange={(e) => {
                      // Du kan legge til søkefunksjonalitet her senere
                    }}
                  />
                </div>
              </div>

              {/* Valgt kategori display */}
              {kategoriId && (
                <div className="px-2 py-1 bg-blue-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-600" size={14} />
                    <span className="text-sm font-medium text-blue-900">
                      Valgt: {(() => {
                        const valgtKat = kategorier.find(k => k.id.toString() === kategoriId);
                        if (valgtKat) return valgtKat.navn;
                        
                        for (const kat of kategorier) {
                          const underKat = kat.underkategorier.find(u => u.id.toString() === kategoriId);
                          if (underKat) return `${kat.navn} - ${underKat.navn}`;
                        }
                        return 'Ukjent kategori';
                      })()}
                    </span>
                  </div>
                  <button
                    onClick={() => setKategoriId('')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Fjern
                  </button>
                </div>
              )}

              {/* Kategori-liste */}
              <div className="max-h-64 overflow-y-auto">
                <div className="p-2 space-y-6">
                  {kategorier.map(kat => (
                    <div key={kat.id} className="bg-white rounded-lg border shadow-sm">
                      {/* Hovedkategori */}
                      <div 
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
                          kategoriId === kat.id.toString() ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setKategoriId(kat.id.toString())}
                      >
                        <div className="flex items-center gap-2">
                          <FaFolder className="text-blue-600" size={16} />
                          <span className="font-medium text-gray-900">{kat.navn}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Hovedkategori
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {kategoriId === kat.id.toString() && (
                            <FaCheck className="text-green-600" size={14} />
                          )}
                          {kat.underkategorier.length > 0 && (
                            <>
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {kat.underkategorier.length} underkategorier
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleKategori(kat.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {utvidetKategorier.includes(kat.id) ? (
                                  <FaChevronDown className="text-gray-500" size={12} />
                                ) : (
                                  <FaChevronRight className="text-gray-500" size={12} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Underkategorier - kun vis hvis utvidet */}
                      {kat.underkategorier.length > 0 && utvidetKategorier.includes(kat.id) && (
                        <div className="border-t bg-gray-50">
                          <div className="p-2 space-y-1">
                            {kat.underkategorier.map(under => (
                              <div
                                key={under.id}
                                className={`p-2 flex items-center justify-between cursor-pointer hover:bg-white rounded transition-colors ${
                                  kategoriId === under.id.toString() ? 'bg-blue-50 border border-blue-200' : ''
                                }`}
                                onClick={() => setKategoriId(under.id.toString())}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-4"></div> {/* Innrykk */}
                                  <FaTag className="text-gray-500" size={12} />
                                  <span className="text-sm text-gray-700">{under.navn}</span>
                                </div>
                                {kategoriId === under.id.toString() && (
                                  <FaCheck className="text-green-600" size={12} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bunntekst */}
              <div className="px-2 py-1 bg-gray-100 rounded-b-lg border-t">
                <p className="text-xs text-gray-600">
                  💡 Klikk på en hovedkategori for å velge den, eller bruk pil-ikonet for å se underkategorier.
                </p>
              </div>
            </div>
          ) : valgteKlasser.length > 0 ? (
            <div className="px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaFolder className="text-yellow-600" />
                <span className="text-yellow-800 font-medium">Ingen kategorier funnet</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Det finnes ingen kategorier for de valgte førerkortklassene. Du kan fortsatt opprette spørsmålet uten kategori.
              </p>
            </div>
          ) : (
            <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaTag className="text-blue-600" />
                <span className="text-blue-800 font-medium">Velg førerkortklasser først</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Du må velge minst én førerkortklasse for å se tilgjengelige kategorier.
              </p>
            </div>
          )}
        </div>

        {/* Knapper */}
        <div className="flex gap-4">
          <button
            onClick={opprettSporsmal}
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Opprett spørsmål
          </button>
          <Link
            to="/quiz/oversikt/sporsmalsbibliotek"
            className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
          >
            Avbryt
          </Link>
        </div>
      </div>

      {/* Bildebibliotek modal */}
      {visBildeVelger && (
        <BildeVelger
          valgtBilde={bildeUrl}
          onVelgBilde={(url) => setBildeUrl(url)}
          onLukkModal={() => setVisBildeVelger(false)}
        />
      )}

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
} 
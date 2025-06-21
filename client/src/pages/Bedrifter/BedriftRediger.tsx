import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';

interface Ansatt {
  id: number;
  navn: string;
  epost: string;
  rolle: string;
}

interface Bedrift {
  id: number;
  navn: string;
  orgNummer: string | null;
  adresse: string | null;
  postnummer: string | null;
  poststed: string | null;
  telefon: string | null;
  epost: string | null;
  hovedbrukerId: number | null;
  hovedbruker?: Ansatt | null;
}

export default function BedriftRediger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | { message?: string } | null>(null);
  const [bedrift, setBedrift] = useState<Bedrift | null>(null);
  const [ansatte, setAnsatte] = useState<Ansatt[]>([]);
  const [lagrer, setLagrer] = useState(false);
  const [alleKlasser, setAlleKlasser] = useState<{ kode: string; omfatter: string; alder: string }[]>([]);
  const [valgteKlasser, setValgteKlasser] = useState<string[]>([]);
  const [lasterKlasser, setLasterKlasser] = useState(false);
  const [lagreKlasserLoading, setLagreKlasserLoading] = useState(false);
  const [lagreKlasserError, setLagreKlasserError] = useState<string|null>(null);

  useEffect(() => {
    const hentData = async () => {
      try {
        setError(null);
        
        // Hent bedrift og ansatte parallelt
        const [bedriftRes, ansatteRes] = await Promise.all([
          api.get(`/bedrifter/${id}`),
          api.get(`/bedrifter/${id}/ansatte`)
        ]);
        
        setBedrift(bedriftRes.data);
        setAnsatte(ansatteRes.data);
      } catch (error: any) {
        console.error('Feil ved henting av data:', error);
        
        let errorMessage = 'Kunne ikke hente bedriftsinformasjon';
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            errorMessage = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
          } else if (status === 403) {
            errorMessage = 'Du har ikke tilgang til denne bedriften.';
          } else if (status === 404) {
            errorMessage = 'Bedrift ikke funnet.';
          } else if (data?.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `Server feil (${status}): ${errorMessage}`;
          }
        } else if (error.request) {
          errorMessage = 'Kunne ikke kontakte serveren. Sjekk internetttilkoblingen.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLasterKlasser(true);
    setLagreKlasserError(null);
    Promise.all([
      api.get(`/reference/foererkort-klasser`),
      api.get(`/bedrifter/${id}/klasser`)
    ])
      .then(([refRes, valgtRes]) => {
        let klasseArray: any[] = [];
        const klasser = refRes.data;
        if (typeof klasser === 'object' && !Array.isArray(klasser)) {
          Object.values(klasser).forEach((kategoriKlasser: any) => {
            kategoriKlasser.forEach((klasse: any) => {
              klasseArray.push({
                kode: klasse.kode,
                omfatter: klasse.beskrivelse || klasse.navn,
                alder: klasse.minimumsalder ? `${klasse.minimumsalder} år` : 'Varierer'
              });
            });
          });
        }
        klasseArray.push(
          { kode: 'E', omfatter: 'Tilhenger og tilhengerredskap (tillegg til klasse B, C1, C, D1 og D)', alder: '18 eller 21 år' },
          { kode: 'M 147', omfatter: 'Tre- og firehjuls moped', alder: '16 år' }
        );
        setAlleKlasser(klasseArray.sort((a, b) => a.kode.localeCompare(b.kode)));
        setValgteKlasser(valgtRes.data || []);
      })
      .catch(() => setLagreKlasserError('Kunne ikke hente klasser'))
      .finally(() => setLasterKlasser(false));
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBedrift(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBedrift(prev => prev ? { 
      ...prev, 
      [name]: value === '' ? null : parseInt(value) 
    } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedrift) return;

    setLagrer(true);
    try {
              await api.put(`/bedrifter/${id}`, {
        navn: bedrift.navn,
        orgNummer: bedrift.orgNummer,
        adresse: bedrift.adresse,
        postnummer: bedrift.postnummer,
        poststed: bedrift.poststed,
        telefon: bedrift.telefon,
        epost: bedrift.epost,
        hovedbrukerId: bedrift.hovedbrukerId
      });
      navigate(`/bedrifter/${id}`);
    } catch (error: any) {
      console.error('Feil ved oppdatering av bedrift:', error);
      
      let errorMessage = 'Kunne ikke oppdatere bedriftsinformasjon';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLagrer(false);
    }
  };

  const handleLagreKlasser = async () => {
    setLagreKlasserLoading(true);
    setLagreKlasserError(null);
    try {
              await api.post(`/bedrifter/${id}/klasser`, { klasser: valgteKlasser });
    } catch (e: any) {
      setLagreKlasserError('Kunne ikke lagre klasser');
    } finally {
      setLagreKlasserLoading(false);
    }
  };

  if (loading) return <div>Laster...</div>;
  if (error) return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rediger bedrift</h1>
      <div className="text-center py-1">
        <div className="text-red-600 mb-4">{typeof error === 'string' ? error : error?.message || 'Ukjent feil'}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-[#003366]/90 mr-2"
        >
          Prøv på nytt
        </button>
        <button 
          onClick={() => navigate('/bedrifter')}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
        >
          Tilbake til bedrifter
        </button>
      </div>
    </div>
  );
  if (!bedrift) return <div>Fant ikke bedriften</div>;

  // Filtrer ansatte som kan være hovedbruker
  const muligeHovedbrukere = ansatte.filter(ansatt => 
    ansatt.rolle === 'HOVEDBRUKER' || ansatt.rolle === 'ADMIN'
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rediger bedrift: {bedrift.navn}</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block mb-1">Bedriftsnavn *</label>
          <input
            name="navn"
            value={bedrift.navn}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Hovedbruker</label>
          <select
            name="hovedbrukerId"
            value={bedrift.hovedbrukerId || ''}
            onChange={handleSelectChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Ingen hovedbruker valgt</option>
            {muligeHovedbrukere.map(ansatt => (
              <option key={ansatt.id} value={ansatt.id}>
                {ansatt.navn} ({ansatt.epost}) - {ansatt.rolle}
              </option>
            ))}
          </select>
          {muligeHovedbrukere.length === 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Ingen ansatte med hovedbruker rolle funnet. Opprett en ansatt med hovedbruker rolle først.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Organisasjonsnummer</label>
          <input
            name="orgNummer"
            value={bedrift.orgNummer || ''}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            placeholder="9 siffer"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Adresse</label>
          <input
            name="adresse"
            value={bedrift.adresse || ''}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="flex cards-spacing-grid mb-4">
          <div className="w-1/3">
            <label className="block mb-1">Postnummer</label>
            <input
              name="postnummer"
              value={bedrift.postnummer || ''}
              onChange={handleInputChange}
              className="border rounded px-2 py-1 w-full"
              placeholder="4 siffer"
            />
          </div>
          <div className="w-2/3">
            <label className="block mb-1">Poststed</label>
            <input
              name="poststed"
              value={bedrift.poststed || ''}
              onChange={handleInputChange}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Telefon</label>
          <input
            name="telefon"
            value={bedrift.telefon || ''}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
            placeholder="8 siffer"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">E-post</label>
          <input
            name="epost"
            type="email"
            value={bedrift.epost || ''}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Førerkortklasser</h2>
          {lasterKlasser ? (
            <div>Laster klasser...</div>
          ) : lagreKlasserError ? (
            <div className="text-red-600 mb-2">{lagreKlasserError}</div>
          ) : (
            <div className="flex flex-wrap gap-0 mb-4">
              {alleKlasser.map((k) => {
                const valgt = valgteKlasser.includes(k.kode);
                return (
                  <button
                    key={k.kode}
                    type="button"
                    onClick={() => setValgteKlasser(valgteKlasser => valgt ? valgteKlasser.filter(c => c !== k.kode) : [...valgteKlasser, k.kode])}
                    className={`card min-w-[180px] flex-1 text-left p-4 border rounded-lg shadow-sm transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${valgt ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-300' : 'bg-white border-gray-300 hover:bg-blue-50'}`}
                    aria-pressed={valgt}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-block w-5 h-5 border rounded ${valgt ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}></span>
                      <span className="font-semibold text-lg">{k.kode}</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{k.omfatter}</div>
                    <div className="text-xs text-gray-500">Aldersgrense: {k.alder}</div>
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-blue-900 mt-4"
            disabled={lagreKlasserLoading}
            onClick={handleLagreKlasser}
          >
            {lagreKlasserLoading ? 'Lagrer...' : 'Lagre klasser'}
          </button>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(`/bedrifter/${id}`)}
            className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={lagrer || !bedrift.navn.trim()}
            className="bg-[#003366] text-white px-2 py-1 rounded hover:bg-blue-900 disabled:opacity-50"
          >
            {lagrer ? 'Lagrer...' : 'Lagre endringer'}
          </button>
        </div>
      </form>
    </div>
  );
} 
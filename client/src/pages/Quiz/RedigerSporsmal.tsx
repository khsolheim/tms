import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCheck, FaUpload } from 'react-icons/fa';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import NotificationDialog from '../../components/ui/NotificationDialog';
import { log } from '../../utils/logger';
import referenceService from '../../services/reference.service';

interface Kategori {
  id: number;
  navn: string;
  klasse: string;
  hovedkategoriId?: number;
  underkategorier: Kategori[];
}

interface Sporsmal {
  id: number;
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  klasser: string[];
  bildeUrl?: string;
  forklaring?: string;
  kategori?: {
    id: number;
    navn: string;
    klasse: string;
    hovedkategoriId?: number;
  };
  opprettet: string;
}

export default function RedigerSporsmal() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sporsmal, setSporsmal] = useState('');
  const [svar, setSvar] = useState(['', '', '', '']);
  const [riktigSvar, setRiktigSvar] = useState(0);
  const [valgteKlasser, setValgteKlasser] = useState<string[]>([]);
  const [kategorier, setKategorier] = useState<Kategori[]>([]);
  const [kategoriId, setKategoriId] = useState('');
  const [bildeUrl, setBildeUrl] = useState('');
  const [forklaring, setForklaring] = useState('');
  const [loading, setLoading] = useState(true);
  const [lagrer, setLagrer] = useState(false);
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
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

  const [klasser, setKlasser] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      lastSporsmal();
      lastKategorier();
      hentKlasser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // lastSporsmal and lastKategorier are intentionally excluded to avoid unnecessary re-renders

  const hentKlasser = async () => {
    try {
      const klasserData = await referenceService.getFørerkortKlasseKoder();
      setKlasser([...klasserData, 'DROSJE']);
    } catch (error) {
      log.error('Feil ved henting av førerkortklasser:', error);
      // Fallback til hardkodet data
      setKlasser(['A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'T', 'S', 'AM146', 'AM147', 'DROSJE']);
    }
  };

  const lastSporsmal = async () => {
    try {
      const response = await fetch(`/api/quiz/sporsmal/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data: Sporsmal = await response.json();
        setSporsmal(data.tekst);
        setSvar(data.svaralternativer.length === 4 ? data.svaralternativer : [...data.svaralternativer, '', '', '', ''].slice(0, 4));
        setRiktigSvar(data.riktigSvar);
        setValgteKlasser(data.klasser);
        setKategoriId(data.kategori?.id.toString() || '');
        setBildeUrl(data.bildeUrl || '');
        setForklaring(data.forklaring || '');
      } else {
        setNotification({
          isOpen: true,
          title: 'Feil',
          message: 'Feil ved lasting av spørsmål',
          type: 'error'
        });
        navigate('/quiz/oversikt/sporsmalsbibliotek');
      }
    } catch (error) {
      log.apiError('sporsmal', error);
      log.error('Feil ved henting av spørsmål data');
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Feil ved lasting av spørsmål',
        type: 'error'
      });
      navigate('/quiz/oversikt/sporsmalsbibliotek');
    }
    setLoading(false);
  };

  const lastKategorier = async () => {
    try {
      const alleKategorier: Kategori[] = [];
      
      for (const klasse of klasser) {
        try {
          const response = await fetch(`/api/quiz/kategorier?klasse=${klasse}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const klasseKategorier = await response.json();
            alleKategorier.push(...klasseKategorier);
          }
        } catch (error) {
          log.apiError(`kategorier/${klasse}`, error);
          log.error(`Feil ved lasting av kategorier for ${klasse}`);
        }
      }
      
      setKategorier(alleKategorier);
    } catch (error) {
      log.apiError('kategorier', error);
      log.error('Feil ved lasting av kategorier');
    }
  };

  const handleKlasseChange = (klasse: string) => {
    setValgteKlasser(prev => 
      prev.includes(klasse) 
        ? prev.filter(k => k !== klasse)
        : [...prev, klasse]
    );
  };

  const oppdaterSporsmal = async () => {
    if (!sporsmal.trim() || !svar.every(s => s.trim()) || valgteKlasser.length === 0) {
      setNotification({
        isOpen: true,
        title: 'Manglende informasjon',
        message: 'Vennligst fyll ut alle obligatoriske felt',
        type: 'warning'
      });
      return;
    }

    setLagrer(true);

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
      const response = await fetch(`/api/quiz/sporsmal/${id}`, {
        method: 'PUT',
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
          message: 'Spørsmål oppdatert!',
          type: 'success'
        });
        navigate('/quiz/oversikt/sporsmalsbibliotek');
      } else {
        log.apiError('sporsmal', response.statusText);
        log.error('Feil ved lagring av spørsmål');
        setNotification({
          isOpen: true,
          title: 'Feil',
          message: 'Feil ved oppdatering av spørsmål',
          type: 'error'
        });
      }
    } catch (error) {
      log.apiError('sporsmal', error);
      log.error('Feil ved lagring av spørsmål');
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Feil ved oppdatering av spørsmål',
        type: 'error'
      });
    }
    setLagrer(false);
  };

  const slettSporsmal = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Slett spørsmål',
      message: 'Er du sikker på at du vil slette dette spørsmålet? Denne handlingen kan ikke angres.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/quiz/sporsmal/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            setNotification({
              isOpen: true,
              title: 'Suksess',
              message: 'Spørsmål slettet!',
              type: 'success'
            });
            navigate('/quiz/oversikt/sporsmalsbibliotek');
          } else {
            log.apiError('sporsmal/delete', response.statusText);
            log.error('Feil ved sletting av spørsmål');
            setNotification({
              isOpen: true,
              title: 'Feil',
              message: 'Feil ved sletting av spørsmål',
              type: 'error'
            });
          }
        } catch (error) {
          log.apiError('sporsmal/delete', error);
          log.error('Feil ved sletting av spørsmål');
          setNotification({
            isOpen: true,
            title: 'Feil',
            message: 'Feil ved sletting av spørsmål',
            type: 'error'
          });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Laster spørsmål...</div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      <div className="flex items-center justify-between">
        <div className="flex items-center cards-spacing-grid">
          <button
            onClick={() => navigate('/quiz/oversikt/sporsmalsbibliotek')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            Tilbake til spørsmålsbibliotek
          </button>
          <h1 className="text-2xl font-bold">Rediger spørsmål #{id}</h1>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={slettSporsmal}
            className="flex items-center gap-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FaTrash size={14} />
            Slett spørsmål
          </button>
        </div>
      </div>
      
      <div className="bg-white px-2 py-1 rounded-lg border shadow-sm">
        {/* Spørsmålstekst */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Spørsmål *</label>
          <textarea
            value={sporsmal}
            onChange={e => setSporsmal(e.target.value)}
            className="w-full border rounded-lg px-2 py-1 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Skriv inn spørsmålsteksten..."
          />
        </div>

        {/* Illustrasjonsbilde */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Illustrasjonsbilde (valgfritt)</label>
          
          <div className="flex gap-4 mb-3">
            <input
              type="url"
              value={bildeUrl}
              onChange={e => setBildeUrl(e.target.value)}
              className="flex-1 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Lim inn bilde-URL eller last opp..."
            />
            <button onClick={() => console.log('Last opp fil')}
              type="button"
              className="flex items-center gap-2 px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <FaUpload size={14} />
              Last opp
            </button>
          </div>

          {bildeUrl && (
            <div className="mb-2">
              <img src={bildeUrl} alt="Forhåndsvisning" className="max-w-xs max-h-48 object-contain border rounded-lg" />
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
                className="mr-3 w-4 h-4 text-blue-600"
              />
              <input
                value={s}
                onChange={e => {
                  const nySvar = [...svar];
                  nySvar[idx] = e.target.value;
                  setSvar(nySvar);
                }}
                className="flex-1 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Svaralternativ ${String.fromCharCode(65 + idx)}...`}
              />
              {riktigSvar === idx && (
                <FaCheck className="ml-2 text-green-600" />
              )}
            </div>
          ))}
        </div>

        {/* Forklaring */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Forklaring (valgfritt)</label>
          <textarea
            value={forklaring}
            onChange={e => setForklaring(e.target.value)}
            className="w-full border rounded-lg px-2 py-1 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Forklar hvorfor svaret er riktig..."
          />
        </div>

        {/* Førerkortklasser */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Førerkortklasser *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {klasser.map((klasse: string) => (
              <label key={klasse} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={valgteKlasser.includes(klasse)}
                  onChange={() => handleKlasseChange(klasse)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{klasse}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Kategori */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Kategori (valgfritt)</label>
          <select
            value={kategoriId}
            onChange={e => setKategoriId(e.target.value)}
            className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Velg kategori...</option>
            {kategorier.map(kategori => (
              <optgroup key={kategori.id} label={kategori.navn}>
                <option value={kategori.id.toString()}>
                  {kategori.navn}
                </option>
                {kategori.underkategorier.map(under => (
                  <option key={under.id} value={under.id.toString()}>
                    → {under.navn}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Handlingsknapper */}
        <div className="flex cards-spacing-grid pt-4 border-t">
          <button
            onClick={oppdaterSporsmal}
            disabled={lagrer}
            className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {lagrer ? 'Lagrer...' : 'Lagre endringer'}
          </button>
          
          <button
            onClick={() => navigate('/quiz/oversikt/sporsmalsbibliotek')}
            className="px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Avbryt
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

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
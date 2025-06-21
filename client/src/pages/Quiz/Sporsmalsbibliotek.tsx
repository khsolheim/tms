import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCopy, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaCheckSquare,
  FaSquare,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaUpload
} from 'react-icons/fa';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import NotificationDialog from '../../components/ui/NotificationDialog';
import { log } from '../../utils/logger';
import referenceService from '../../services/reference.service';

interface Kategori {
  id: number;
  navn: string;
  klasse: string;
  hovedkategoriId?: number;
  underkategorier?: Kategori[];
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

interface GruppertSporsmal {
  id: string; // Generert ID for gruppen
  originalIds: number[]; // Liste over originale spørsmål-IDer
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  alleKlasser: string[]; // Kombinerte klasser fra alle spørsmål
  bildeUrl?: string;
  forklaring?: string;
  kategori?: {
    id: number;
    navn: string;
    klasse: string;
    hovedkategoriId?: number;
  };
  opprettet: string; // Eldste opprettelsesdato
}

type SortField = 'id' | 'tekst' | 'klasser' | 'kategori' | 'opprettet';
type SortDirection = 'asc' | 'desc';

export default function Sporsmalsbibliotek() {
  const [sporsmal, setSporsmal] = useState<Sporsmal[]>([]);
  const [kategorier, setKategorier] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingKategorier, setLoadingKategorier] = useState(true);
  
  // Filter state
  const [filterKlasse, setFilterKlasse] = useState('');
  const [filterHovedkategori, setFilterHovedkategori] = useState('');
  const [filterUnderkategori, setFilterUnderkategori] = useState('');
  const [sokTekst, setSokTekst] = useState('');
  
  // Bulk actions state
  const [valgteSporsmal, setValgteSporsmal] = useState<Set<string>>(new Set());
  // Sort state
  const [sortField, setSortField] = useState<SortField>('opprettet');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Modal state
  const [visBulkModal, setVisBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'copy' | 'delete' | 'edit' | null>(null);
  const [visSporsmalModal, setVisSporsmalModal] = useState(false);
  const [valgtSporsmalForVisning, setValgtSporsmalForVisning] = useState<GruppertSporsmal | null>(null);
  const [kopiererSporsmal, setKopiererSporsmal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
    details?: string[];
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

  const [klasseFilter, setKlasseFilter] = useState<string[]>([]);

  useEffect(() => {
    hentKlasseFilter();
    lastSporsmal();
    lastKategorier();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKlasse, filterHovedkategori, filterUnderkategori]); // lastSporsmal and lastKategorier are intentionally excluded to avoid unnecessary re-renders

  const hentKlasseFilter = async () => {
    try {
      const klasser = await referenceService.getFørerkortKlasseKoder();
      setKlasseFilter([...klasser, 'DROSJE']);
    } catch (error) {
      log.error('Feil ved henting av førerkortklasser:', error);
      // Fallback til hardkodet data
      setKlasseFilter(['A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'T', 'S', 'AM146', 'AM147', 'DROSJE']);
    }
  };

  const lastSporsmal = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterKlasse) queryParams.append('klasse', filterKlasse);
      if (filterUnderkategori) queryParams.append('kategoriId', filterUnderkategori);
      
      const response = await fetch(`/api/quiz/sporsmal?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSporsmal(data);
      } else {
        log.apiError('sporsmal', new Error('Feil ved lasting av spørsmål'));
        log.error('Feil ved lasting av spørsmål');
      }
    } catch (error) {
      log.apiError('sporsmal', error);
      log.error('Feil:', error);
    }
    setLoading(false);
  };

  const lastKategorier = async () => {
    setLoadingKategorier(true);
    try {
      const alleKategorier: Kategori[] = [];
      
      for (const klasse of klasseFilter) {
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
          log.error(`Feil ved lasting av kategorier for ${klasse}:`, error);
        }
      }
      
      setKategorier(alleKategorier);
    } catch (error) {
      log.apiError('kategorier', error);
      log.error('Feil ved lasting av kategorier:', error);
    }
    setLoadingKategorier(false);
  };

  // Grupper identiske spørsmål
  const grupperteSporsmal = useMemo(() => {
    const sporsmalMap = new Map<string, GruppertSporsmal>();
    
    sporsmal.forEach(s => {
      // Lag en nøkkel basert på spørsmålstekst, svaralternativer og riktig svar
      const nokkel = `${s.tekst}|${s.svaralternativer.join('|')}|${s.riktigSvar}|${s.forklaring || ''}`;
      
      if (sporsmalMap.has(nokkel)) {
        // Spørsmål finnes allerede, legg til klasser
        const eksisterende = sporsmalMap.get(nokkel)!;
        const kombinerteKlasser = new Set([...eksisterende.alleKlasser, ...s.klasser]);
        eksisterende.alleKlasser = Array.from(kombinerteKlasser);
        eksisterende.originalIds.push(s.id);
        
        // Bruk eldste opprettelsesdato
        if (new Date(s.opprettet) < new Date(eksisterende.opprettet)) {
          eksisterende.opprettet = s.opprettet;
        }
      } else {
        // Nytt spørsmål
        sporsmalMap.set(nokkel, {
          id: nokkel,
          originalIds: [s.id],
          tekst: s.tekst,
          svaralternativer: s.svaralternativer,
          riktigSvar: s.riktigSvar,
          alleKlasser: [...s.klasser],
          bildeUrl: s.bildeUrl,
          forklaring: s.forklaring,
          kategori: s.kategori,
          opprettet: s.opprettet
        });
      }
    });
    
    return Array.from(sporsmalMap.values());
  }, [sporsmal]);

  // Memoized filtered and sorted data
  const processedSporsmal = useMemo(() => {
    let filtered = grupperteSporsmal.filter(s => {
      const matchSok = sokTekst === '' || 
        s.tekst.toLowerCase().includes(sokTekst.toLowerCase()) ||
        s.alleKlasser.some(k => k.toLowerCase().includes(sokTekst.toLowerCase())) ||
        (s.kategori?.navn || '').toLowerCase().includes(sokTekst.toLowerCase());
      
      const matchKlasse = !filterKlasse || s.alleKlasser.includes(filterKlasse);
      
      const matchHovedkategori = !filterHovedkategori || 
        s.kategori?.hovedkategoriId?.toString() === filterHovedkategori ||
        (s.kategori && !s.kategori.hovedkategoriId && s.kategori.id.toString() === filterHovedkategori);
      
      return matchSok && matchKlasse && matchHovedkategori;
    });

    // Sortering
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = Math.min(...a.originalIds);
          bValue = Math.min(...b.originalIds);
          break;
        case 'tekst':
          aValue = a.tekst.toLowerCase();
          bValue = b.tekst.toLowerCase();
          break;
        case 'klasser':
          aValue = a.alleKlasser.join(', ');
          bValue = b.alleKlasser.join(', ');
          break;
        case 'kategori':
          aValue = a.kategori?.navn || '';
          bValue = b.kategori?.navn || '';
          break;
        case 'opprettet':
          aValue = new Date(a.opprettet);
          bValue = new Date(b.opprettet);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [grupperteSporsmal, sokTekst, filterKlasse, filterHovedkategori, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(processedSporsmal.length / itemsPerPage);
  const currentSporsmal = processedSporsmal.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="opacity-50" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const toggleSporsmalValg = (id: string) => {
    const newSelected = new Set(valgteSporsmal);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setValgteSporsmal(newSelected);
  };

  const toggleAlleSporsmal = () => {
    if (valgteSporsmal.size === currentSporsmal.length) {
      setValgteSporsmal(new Set());
    } else {
      setValgteSporsmal(new Set(currentSporsmal.map(s => s.id)));
    }
  };

  const slettSporsmal = async (gruppertSporsmal: GruppertSporsmal) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Slett spørsmål',
      message: `Er du sikker på at du vil slette dette spørsmålet? Det vil slette ${gruppertSporsmal.originalIds.length} spørsmål (for ${gruppertSporsmal.alleKlasser.length} klasser).`,
      type: 'danger',
      details: [
        `${gruppertSporsmal.originalIds.length} spørsmål`,
        `For ${gruppertSporsmal.alleKlasser.length} klasser: ${gruppertSporsmal.alleKlasser.join(', ')}`
      ],
      onConfirm: async () => {
        try {
          for (const id of gruppertSporsmal.originalIds) {
            await fetch(`/api/quiz/sporsmal/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          }
          
          setNotification({
            isOpen: true,
            title: 'Suksess',
            message: `${gruppertSporsmal.originalIds.length} spørsmål slettet`,
            type: 'success'
          });
          
          lastSporsmal();
        } catch (error) {
          log.apiError('sporsmal/delete', error);
          log.error('Feil ved sletting av spørsmål:', error);
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

  const handleBulkAction = (action: 'copy' | 'delete' | 'edit') => {
    setBulkAction(action);
    setVisBulkModal(true);
  };

  const executeBulkAction = async () => {
    if (bulkAction === 'delete') {
      const alleOriginalIds = Array.from(valgteSporsmal).flatMap(id => {
        const gruppert = grupperteSporsmal.find(g => g.id === id);
        return gruppert ? gruppert.originalIds : [];
      });

      setConfirmDialog({
        isOpen: true,
        title: 'Slett flere spørsmål',
        message: `Er du sikker på at du vil slette ${valgteSporsmal.size} spørsmålsgrupper? Dette vil slette totalt ${alleOriginalIds.length} spørsmål fra databasen.`,
        type: 'danger',
        details: [
          `${valgteSporsmal.size} spørsmålsgrupper`,
          `Totalt ${alleOriginalIds.length} spørsmål`
        ],
        onConfirm: async () => {
          try {
            for (const id of alleOriginalIds) {
              await fetch(`/api/quiz/sporsmal/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
            }
            
            setNotification({
              isOpen: true,
              title: 'Suksess',
              message: `${alleOriginalIds.length} spørsmål slettet (${valgteSporsmal.size} spørsmålsgrupper)`,
              type: 'success'
            });
            
            setValgteSporsmal(new Set());
            lastSporsmal();
          } catch (error) {
            log.apiError('sporsmal/bulk-delete', error);
            log.error('Feil ved sletting av spørsmål:', error);
            setNotification({
              isOpen: true,
              title: 'Feil',
              message: 'Feil ved sletting av spørsmål',
              type: 'error'
            });
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setVisBulkModal(false);
        }
      });
         } else if (bulkAction === 'copy') {
       const alleOriginalIds = Array.from(valgteSporsmal).flatMap(id => {
         const gruppert = grupperteSporsmal.find(g => g.id === id);
         return gruppert ? gruppert.originalIds : [];
       });
       setNotification({
         isOpen: true,
         title: 'Info',
         message: `Kopiering av ${valgteSporsmal.size} spørsmålsgrupper (${alleOriginalIds.length} spørsmål) - funksjonalitet kommer snart`,
         type: 'info'
       });
     } else if (bulkAction === 'edit') {
       const alleOriginalIds = Array.from(valgteSporsmal).flatMap(id => {
         const gruppert = grupperteSporsmal.find(g => g.id === id);
         return gruppert ? gruppert.originalIds : [];
       });
       setNotification({
         isOpen: true,
         title: 'Info',
         message: `Redigering av ${valgteSporsmal.size} spørsmålsgrupper (${alleOriginalIds.length} spørsmål) - funksjonalitet kommer snart`,
         type: 'info'
       });
    }
    setVisBulkModal(false);
  };

  const hovedkategorier = kategorier.filter(k => !k.hovedkategoriId);
  const underkategorier = kategorier.filter(k => 
    k.hovedkategoriId?.toString() === filterHovedkategori
  );

  // Hjelpefunksjon for å vise klasser
  const visKlasser = (alleKlasser: string[]) => {
    if (alleKlasser.length === klasseFilter.length) {
      return "Alle";
    }
    
    if (alleKlasser.length <= 3) {
      return alleKlasser.map(klasse => (
        <span key={klasse} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {klasse}
        </span>
      ));
    }
    
    return (
      <>
        {alleKlasser.slice(0, 3).map(klasse => (
          <span key={klasse} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {klasse}
          </span>
        ))}
        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs" title={alleKlasser.slice(3).join(', ')}>
          +{alleKlasser.length - 3}
        </span>
      </>
    );
  };

  const visSporsmal = (gruppertSporsmal: GruppertSporsmal) => {
    setValgtSporsmalForVisning(gruppertSporsmal);
    setVisSporsmalModal(true);
  };

  const kopierSporsmal = async (gruppertSporsmal: GruppertSporsmal) => {
    setKopiererSporsmal(true);
    try {
      // Kopier spørsmålet til alle klasser det originalt tilhørte
      for (const klasse of gruppertSporsmal.alleKlasser) {
        const kopiData = {
          tekst: `${gruppertSporsmal.tekst} (kopi)`,
          svaralternativer: gruppertSporsmal.svaralternativer,
          riktigSvar: gruppertSporsmal.riktigSvar,
          klasser: [klasse], // En kopi per klasse
          kategoriId: gruppertSporsmal.kategori?.id || null,
          bildeUrl: gruppertSporsmal.bildeUrl || null,
          forklaring: gruppertSporsmal.forklaring || null
        };

        const response = await fetch('/api/quiz/sporsmal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(kopiData)
        });

        if (!response.ok) {
          throw new Error(`Feil ved kopiering for klasse ${klasse}`);
        }
      }

      // Oppdater listen
      await lastSporsmal();
      setNotification({
        isOpen: true,
        title: 'Suksess',
        message: `Spørsmål kopiert for ${gruppertSporsmal.alleKlasser.length} klasser`,
        type: 'success'
      });
    } catch (error) {
      log.apiError('sporsmal/copy', error);
      log.error('Feil ved kopiering:', error);
      setNotification({
        isOpen: true,
        title: 'Feil',
        message: 'Feil ved kopiering av spørsmål',
        type: 'error'
      });
    } finally {
      setKopiererSporsmal(false);
    }
  };

  const redigerSporsmal = (gruppertSporsmal: GruppertSporsmal) => {
    // For grupperte spørsmål, rediger det første (laveste ID)
    const sporsmalId = Math.min(...gruppertSporsmal.originalIds);
    window.open(`/quiz/rediger-sporsmal/${sporsmalId}`, '_blank');
  };

  return (
    <div className="cards-spacing-vertical">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spørsmålsbibliotek</h1>
        <div className="flex gap-4">
          <button onClick={() => console.log('Eksporter data')} className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
            <FaDownload size={14} />
            Eksporter
          </button>
          <button onClick={() => console.log('Importer data')} className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
            <FaUpload size={14} />
            Importer
          </button>
          <Link 
            to="/quiz/opprett-sporsmal" 
            className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            <FaPlus size={14} />
            Nytt spørsmål
          </Link>
        </div>
      </div>
      
      {/* Filtre */}
      <div className="bg-white px-2 py-1 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Søk</label>
            <input
              type="text"
              value={sokTekst}
              onChange={e => setSokTekst(e.target.value)}
              className="w-full text-sm border rounded px-2 py-1"
              placeholder="Søk i spørsmål..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Klasse</label>
            <select
              value={filterKlasse}
              onChange={e => setFilterKlasse(e.target.value)}
              className="w-full text-sm border rounded px-2 py-1"
            >
              <option value="">Alle klasser</option>
              {klasseFilter.map((klasse: string) => (
                <option key={klasse} value={klasse}>{klasse}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hovedkategori</label>
            <select
              value={filterHovedkategori}
              onChange={e => {
                setFilterHovedkategori(e.target.value);
                setFilterUnderkategori('');
              }}
              className="w-full text-sm border rounded px-2 py-1"
              disabled={loadingKategorier}
            >
              <option value="">Alle kategorier</option>
              {hovedkategorier.map(kat => (
                <option key={kat.id} value={kat.id.toString()}>
                  {kat.navn}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Underkategori</label>
            <select
              value={filterUnderkategori}
              onChange={e => setFilterUnderkategori(e.target.value)}
              className="w-full text-sm border rounded px-2 py-1"
              disabled={!filterHovedkategori}
            >
              <option value="">Alle underkategorier</option>
              {underkategorier.map(kat => (
                <option key={kat.id} value={kat.id.toString()}>
                  {kat.navn}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vis per side</label>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full text-sm border rounded px-2 py-1"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {valgteSporsmal.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">
              {valgteSporsmal.size} spørsmålsgrupper valgt
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => handleBulkAction('copy')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <FaCopy size={12} />
                Kopier
              </button>
              <button
                onClick={() => handleBulkAction('edit')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                <FaEdit size={12} />
                Rediger
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaTrash size={12} />
                Slett
              </button>
              <button
                onClick={() => setValgteSporsmal(new Set())}
                className="text-xs text-blue-600 hover:text-blue-800 px-2"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistikk */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Viser {currentSporsmal.length} av {processedSporsmal.length} unike spørsmål
          {processedSporsmal.length !== grupperteSporsmal.length && ` (totalt ${grupperteSporsmal.length})`}
          {` • ${sporsmal.length} totale spørsmålsinstanser i databasen`}
        </span>
        {loading && <span>Laster...</span>}
      </div>

      {/* Tabell */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-2 py-1">
                  <button onClick={toggleAlleSporsmal}>
                    {valgteSporsmal.size === currentSporsmal.length && currentSporsmal.length > 0 ? 
                      <FaCheckSquare className="text-blue-600" /> : 
                      <FaSquare className="text-gray-400" />
                    }
                  </button>
                </th>
                <th 
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    ID {getSortIcon('id')}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('tekst')}
                >
                  <div className="flex items-center gap-1">
                    Spørsmål {getSortIcon('tekst')}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('klasser')}
                >
                  <div className="flex items-center gap-1">
                    Klasser {getSortIcon('klasser')}
                  </div>
                </th>
                <th 
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('kategori')}
                >
                  <div className="flex items-center gap-1">
                    Kategori {getSortIcon('kategori')}
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th 
                  className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('opprettet')}
                >
                  <div className="flex items-center gap-1">
                    Opprettet {getSortIcon('opprettet')}
                  </div>
                </th>
                <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSporsmal.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1">
                    <button onClick={() => toggleSporsmalValg(s.id)}>
                      {valgteSporsmal.has(s.id) ? 
                        <FaCheckSquare className="text-blue-600" /> : 
                        <FaSquare className="text-gray-400" />
                      }
                    </button>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">
                    #{Math.min(...s.originalIds)}
                    {s.originalIds.length > 1 && (
                      <span className="ml-1 px-1 bg-blue-100 text-blue-800 rounded text-xs">
                        +{s.originalIds.length - 1}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    <div className="max-w-md">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {s.tekst}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {s.svaralternativer.length} alternativer
                        {s.bildeUrl && <span className="ml-2 px-1 bg-green-100 text-green-800 rounded">📷</span>}
                        {s.forklaring && <span className="ml-1 px-1 bg-blue-100 text-blue-800 rounded">💡</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {s.alleKlasser.length === klasseFilter.length ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          Alle
                        </span>
                      ) : (
                        visKlasser(s.alleKlasser)
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">
                    {s.kategori ? (
                      <div className="max-w-32 truncate" title={s.kategori.navn}>
                        {s.kategori.navn}
                      </div>
                    ) : (
                      <span className="text-gray-400">Ingen kategori</span>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Aktiv
                    </span>
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-500">
                    {new Date(s.opprettet).toLocaleDateString('no-NO')}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => visSporsmal(s)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Vis spørsmål"
                      >
                        <FaEye size={14} />
                      </button>
                      <button 
                        onClick={() => kopierSporsmal(s)}
                        disabled={kopiererSporsmal}
                        className="p-1 text-gray-500 hover:text-green-600 disabled:opacity-50"
                        title="Kopier spørsmål"
                      >
                        <FaCopy size={14} />
                      </button>
                      <button 
                        onClick={() => redigerSporsmal(s)}
                        className="p-1 text-gray-500 hover:text-orange-600"
                        title="Rediger spørsmål"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => slettSporsmal(s)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Slett spørsmål"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginering */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-2 py-1 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              Side {currentPage} av {totalPages}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Forrige
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Neste
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tom state */}
      {!loading && processedSporsmal.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-gray-500 mb-4">
            {sporsmal.length === 0 ? 'Ingen spørsmål funnet' : 'Ingen spørsmål matcher søkekriteriene'}
          </div>
          <Link 
            to="/quiz/opprett-sporsmal" 
            className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlus size={14} />
            Opprett første spørsmål
          </Link>
        </div>
      )}

      {/* Spørsmålsvisningsmodal */}
      {visSporsmalModal && valgtSporsmalForVisning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold">Spørsmålsdetaljer</h3>
              <button
                onClick={() => setVisSporsmalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="cards-spacing-vertical">
              {/* Spørsmålsinfo */}
              <div>
                <div className="flex cards-spacing-grid mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    ID: #{Math.min(...valgtSporsmalForVisning.originalIds)}
                    {valgtSporsmalForVisning.originalIds.length > 1 && ` (+${valgtSporsmalForVisning.originalIds.length - 1})`}
                  </span>
                  {valgtSporsmalForVisning.kategori && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {valgtSporsmalForVisning.kategori.navn}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {new Date(valgtSporsmalForVisning.opprettet).toLocaleDateString('no-NO')}
                  </span>
                </div>

                <h4 className="font-medium text-lg mb-4">{valgtSporsmalForVisning.tekst}</h4>

                {/* Klasser */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Gjelder for klasser:</span>
                  <div className="flex flex-wrap gap-2">
                    {valgtSporsmalForVisning.alleKlasser.length === klasseFilter.length ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        Alle klasser
                      </span>
                    ) : (
                      valgtSporsmalForVisning.alleKlasser.map(klasse => (
                        <span key={klasse} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {klasse}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bilde hvis det finnes */}
              {valgtSporsmalForVisning.bildeUrl && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Illustrasjon:</h5>
                  <img 
                    src={valgtSporsmalForVisning.bildeUrl} 
                    alt="Spørsmålsillustrasjon" 
                    className="max-w-md max-h-64 object-contain border rounded"
                  />
                </div>
              )}

              {/* Svaralternativer */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Svaralternativer:</h5>
                <div className="space-y-6">
                  {valgtSporsmalForVisning.svaralternativer.map((svar, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 p-3 rounded border ${
                        idx === valgtSporsmalForVisning.riktigSvar 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        idx === valgtSporsmalForVisning.riktigSvar
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`flex-1 ${
                        idx === valgtSporsmalForVisning.riktigSvar ? 'font-medium' : ''
                      }`}>
                        {svar}
                      </span>
                      {idx === valgtSporsmalForVisning.riktigSvar && (
                        <span className="text-green-600 font-medium">✓ Riktig</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Forklaring */}
              {valgtSporsmalForVisning.forklaring && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Forklaring:</h5>
                  <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-gray-800 leading-relaxed">{valgtSporsmalForVisning.forklaring}</p>
                  </div>
                </div>
              )}

              {/* Handlinger */}
              <div className="flex cards-spacing-grid pt-4 border-t">
                <button
                  onClick={() => kopierSporsmal(valgtSporsmalForVisning)}
                  disabled={kopiererSporsmal}
                  className="flex items-center gap-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <FaCopy size={14} />
                  {kopiererSporsmal ? 'Kopierer...' : 'Kopier spørsmål'}
                </button>
                <button
                  onClick={() => redigerSporsmal(valgtSporsmalForVisning)}
                  className="flex items-center gap-2 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  <FaEdit size={14} />
                  Rediger spørsmål
                </button>
                <button
                  onClick={() => {
                    setVisSporsmalModal(false);
                    slettSporsmal(valgtSporsmalForVisning);
                  }}
                  className="flex items-center gap-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FaTrash size={14} />
                  Slett spørsmål
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action modal */}
      {visBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Bekreft {bulkAction === 'copy' ? 'kopiering' : bulkAction === 'edit' ? 'redigering' : 'sletting'}
            </h3>
            <p className="text-gray-600 mb-6">
              Er du sikker på at du vil {bulkAction === 'copy' ? 'kopiere' : bulkAction === 'edit' ? 'redigere' : 'slette'} {valgteSporsmal.size} spørsmålsgrupper?
            </p>
            <div className="flex justify-end cards-spacing-grid">
              <button
                onClick={() => setVisBulkModal(false)}
                className="px-2 py-1 text-gray-600 border rounded hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={executeBulkAction}
                className={`px-4 py-2 text-white rounded ${
                  bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {bulkAction === 'copy' ? 'Kopier' : bulkAction === 'edit' ? 'Rediger' : 'Slett'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        details={confirmDialog.details}
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
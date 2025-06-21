import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { log } from '../../utils/logger';
import { referenceService } from '../../services/reference.service';

export default function OpprettQuiz() {
  const [navn, setNavn] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [tidsgrense, setTidsgrense] = useState('30');
  const [antallSporsmal, setAntallSporsmal] = useState('10');
  const [valgtKategorier, setValgtKategorier] = useState<string[]>([]);
  const [kategorier, setKategorier] = useState<string[]>(['Trafikkskilt', 'Førerkort', 'Trafikksikkerhet', 'Miljø', 'Kjøring']); // Fallback
  const [loading, setLoading] = useState(true);

  // Hent kategorier fra API
  useEffect(() => {
    const hentKategorier = async () => {
      try {
        setLoading(true);
        // Hent quiz-kategorier fra reference service
        const quizKategorier = await referenceService.getQuizKategorier();
        const kategorinavn = quizKategorier.map(kat => kat.navn);
        setKategorier(kategorinavn);
      } catch (error) {
        log.error('Feil ved henting av quiz-kategorier:', error);
        log.error('Bruker fallback data');
        // Beholder fallback kategorier som er satt i useState
      } finally {
        setLoading(false);
      }
    };

    hentKategorier();
  }, []);

  const toggleKategori = (kategori: string) => {
    setValgtKategorier(prev =>
      prev.includes(kategori)
        ? prev.filter(k => k !== kategori)
        : [...prev, kategori]
    );
  };

  const opprettQuiz = () => {
    // logger.info({ navn, beskrivelse, tidsgrense, antallSporsmal, valgtKategorier });
    // Kall til API her
    alert('Quiz opprettet!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Opprett quiz</h1>
      
      <div className="bg-white px-2 py-1 rounded border shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Navn på quiz</label>
          <input
            value={navn}
            onChange={e => setNavn(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="F.eks. Førerkort klasse B"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Beskrivelse</label>
          <textarea
            value={beskrivelse}
            onChange={e => setBeskrivelse(e.target.value)}
            className="w-full border rounded px-2 py-1 h-24"
            placeholder="Beskriv hva quizen handler om..."
          />
        </div>

        <div className="grid grid-cols-2 cards-spacing-grid mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tidsgrense (minutter)</label>
            <input
              type="number"
              value={tidsgrense}
              onChange={e => setTidsgrense(e.target.value)}
              className="w-full border rounded px-2 py-1"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Antall spørsmål</label>
            <input
              type="number"
              value={antallSporsmal}
              onChange={e => setAntallSporsmal(e.target.value)}
              className="w-full border rounded px-2 py-1"
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Kategorier</label>
          {loading ? (
            <div className="flex items-center justify-center py-1">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Laster kategorier...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {kategorier.map(kat => (
                <label key={kat} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={valgtKategorier.includes(kat)}
                    onChange={() => toggleKategori(kat)}
                    className="mr-2"
                  />
                  {kat}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={opprettQuiz}
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Opprett quiz
          </button>
          <Link
            to="/quiz"
            className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
          >
            Avbryt
          </Link>
        </div>
      </div>
    </div>
  );
} 
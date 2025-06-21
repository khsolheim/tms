import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService, type QuizKategori } from '../../services/quiz.service';

export default function RedigerKategori() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [kategori, setKategori] = useState<QuizKategori | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    navn: '',
    beskrivelse: '',
    farge: '#3B82F6',
    ikon: '',
    aktiv: true
  });

  useEffect(() => {
    const hentKategori = async () => {
      if (!id) {
        setError('Kategori ID mangler');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const kategoriData = await quizService.hentKategori(id);
        setKategori(kategoriData);
        setFormData({
          navn: kategoriData.navn,
          beskrivelse: kategoriData.beskrivelse || '',
          farge: kategoriData.farge,
          ikon: kategoriData.ikon || '',
          aktiv: kategoriData.aktiv
        });
        setError(null);
      } catch (err) {
        console.error('Feil ved henting av kategori:', err);
        setError('Kunne ikke hente kategori');
      } finally {
        setLoading(false);
      }
    };

    hentKategori();
  }, [id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlett = async () => {
    if (!id || !kategori) return;
    setShowConfirm(true);
  };

  const bekreftSlett = async () => {
    if (!id || !kategori) return;
    try {
      setSaving(true);
      setShowConfirm(false);
      await quizService.slettKategori(id);
      alert('Kategori slettet!');
      navigate('/quiz/oversikt/kategorier');
    } catch (err) {
      console.error('Feil ved sletting av kategori:', err);
      alert('Kunne ikke slette kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleLagre = async () => {
    if (!id) return;

    if (!formData.navn.trim()) {
      alert('Kategori-navn er påkrevd');
      return;
    }

    try {
      setSaving(true);
      await quizService.oppdaterKategori(id, formData);
      alert('Kategori lagret!');
      navigate('/quiz/oversikt/kategorier');
    } catch (err) {
      console.error('Feil ved lagring av kategori:', err);
      alert('Kunne ikke lagre kategori');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Laster kategori...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={() => navigate('/quiz/oversikt/kategorier')}
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Tilbake til kategorier
        </button>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-800">Kategori ikke funnet</div>
        <button 
          onClick={() => navigate('/quiz/oversikt/kategorier')}
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Tilbake til kategorier
        </button>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Modal for sletting */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Bekreft sletting</h2>
            <p className="mb-6">Er du sikker på at du vil slette kategorien "{kategori.navn}"?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Avbryt
              </button>
              <button
                onClick={bekreftSlett}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Sletter...' : 'Slett'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Rediger kategori</h1>
          <p className="text-sm text-gray-600 mt-1">
            Opprettet: {new Date(kategori.opprettDato).toLocaleDateString('nb-NO')} | 
            Sist oppdatert: {new Date(kategori.sistOppdatert).toLocaleDateString('nb-NO')}
          </p>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Kategori-navn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori-navn *
            </label>
            <input 
              type="text"
              value={formData.navn} 
              onChange={e => handleInputChange('navn', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Skriv inn kategori-navn..."
            />
          </div>

          {/* Beskrivelse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse
            </label>
            <textarea 
              value={formData.beskrivelse} 
              onChange={e => handleInputChange('beskrivelse', e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Beskriv kategorien..."
            />
          </div>

          {/* Farge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farge
            </label>
            <div className="flex items-center space-x-3">
              <input 
                type="color"
                value={formData.farge} 
                onChange={e => handleInputChange('farge', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input 
                type="text"
                value={formData.farge} 
                onChange={e => handleInputChange('farge', e.target.value)}
                className="border rounded px-3 py-2 bg-white text-gray-900 font-mono text-sm"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Ikon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ikon (valgfritt)
            </label>
            <input 
              type="text"
              value={formData.ikon} 
              onChange={e => handleInputChange('ikon', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="f.eks. FaRoad, FaShield, FaCog..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Bruk React Icons navn (f.eks. FaRoad for vei-ikon)
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox"
                checked={formData.aktiv} 
                onChange={e => handleInputChange('aktiv', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Kategori er aktiv
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inaktive kategorier vises ikke i quiz-opprettelse
            </p>
          </div>

          {/* Statistikk */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Statistikk</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Antall quizer:</span>
                <span className="ml-2 font-medium">{kategori.antallQuizer}</span>
              </div>
              <div>
                <span className="text-gray-500">Antall spørsmål:</span>
                <span className="ml-2 font-medium">{kategori.antallSpørsmål}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Handlinger */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button 
            onClick={handleSlett} 
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Sletter...' : 'Slett kategori'}
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/quiz/oversikt/kategorier')}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Avbryt
            </button>
            <button 
              onClick={handleLagre} 
              disabled={saving || !formData.navn.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Lagrer...' : 'Lagre endringer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
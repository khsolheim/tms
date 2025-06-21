import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaSearch } from 'react-icons/fa';
import { referenceService } from '../../services/reference.service';

interface Bilde {
  id: number;
  navn: string;
  beskrivelse?: string;
  url: string;
  tags: string[];
  storrelse: number;
  mimeType: string;
  opprettet: string;
}

export default function Bildebibliotek() {
  const [bilder, setBilder] = useState<Bilde[]>([]);
  const [loading, setLoading] = useState(true);
  const [sokTekst, setSokTekst] = useState('');
  const [selectedBilde, setSelectedBilde] = useState<Bilde | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [uploadForm, setUploadForm] = useState({
    navn: '',
    beskrivelse: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filstorrelser, setFilstorrelser] = useState<string[]>(['Bytes', 'KB', 'MB', 'GB']); // Fallback

  useEffect(() => {
    lastBilder();
    hentFilstorrelser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sokTekst]); // lastBilder is intentionally excluded to avoid unnecessary re-renders

  const hentFilstorrelser = async () => {
    try {
      const enheter = await referenceService.getFilstorrelser('lang');
      setFilstorrelser(enheter);
    } catch (error) {
      console.error('Feil ved henting av filstørrelse-enheter:', error);
      // Beholder fallback-verdier ved feil
    }
  };

  const lastBilder = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (sokTekst) queryParams.append('sok', sokTekst);
      
      const response = await fetch(`/api/bilder?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBilder(data);
      }
    } catch (error) {
      console.error('Feil ved lasting av bilder:', error);
    }
    setLoading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, navn: prev.navn || file.name }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('bilde', selectedFile);
    formData.append('navn', uploadForm.navn || selectedFile.name);
    formData.append('beskrivelse', uploadForm.beskrivelse);
    formData.append('tags', uploadForm.tags);

    try {
      const response = await fetch('/api/bilder/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const nyttBilde = await response.json();
        setBilder(prev => [nyttBilde, ...prev]);
        setUploadForm({ navn: '', beskrivelse: '', tags: '' });
        setPreviewImage(null);
        setSelectedFile(null);
        setShowUploadModal(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ukjent feil' }));
        alert(`Feil ved opplasting av bilde: ${errorData.error || 'Ukjent feil'}`);
      }
    } catch (error) {
      alert(`Feil ved opplasting av bilde: ${error instanceof Error ? error.message : 'Nettverksfeil'}`);
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId === id) {
      // Second click - actually delete
      try {
        const response = await fetch(`/api/bilder/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setBilder(prev => prev.filter(b => b.id !== id));
          setSelectedBilde(null);
          setDeleteConfirmId(null);
        }
      } catch (error) {
        alert('Feil ved sletting av bilde');
      }
    } else {
      // First click - show confirmation
      setDeleteConfirmId(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${filstorrelser[0] || 'Bytes'}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const enhetsIndex = Math.min(i, filstorrelser.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + filstorrelser[enhetsIndex];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO');
  };

  return (
    <div className="cards-spacing-vertical">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bildebibliotek</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaUpload /> Last opp nytt bilde
        </button>
      </div>

      {/* Søk */}
      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          value={sokTekst}
          onChange={e => setSokTekst(e.target.value)}
          className="flex-1 border-none outline-none"
          placeholder="Søk etter bilder, tags eller beskrivelser..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* Bildegalleri */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-1">Laster bilder...</div>
          ) : bilder.length === 0 ? (
            <div className="text-center py-1 text-gray-500">
              Ingen bilder funnet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 cards-spacing-grid">
              {bilder.map(bilde => (
                <div 
                  key={bilde.id}
                  onClick={() => {
                    setSelectedBilde(bilde);
                    setDeleteConfirmId(null);
                  }}
                  className={`cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                    selectedBilde?.id === bilde.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="aspect-square">
                    <img 
                      src={bilde.url} 
                      alt={bilde.navn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium truncate">{bilde.navn}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(bilde.storrelse)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detaljpanel */}
        <div className="bg-white rounded-lg shadow px-2 py-1">
          {selectedBilde ? (
            <div className="cards-spacing-vertical">
              <div className="aspect-square">
                <img 
                  src={selectedBilde.url} 
                  alt={selectedBilde.navn}
                  className="w-full h-full object-cover rounded"
                  onClick={() => setDeleteConfirmId(null)}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{selectedBilde.navn}</h3>
                {selectedBilde.beskrivelse && (
                  <p className="text-gray-600 mb-2">{selectedBilde.beskrivelse}</p>
                )}
                <div className="text-sm text-gray-500 space-y-1">
                  <div><strong>Størrelse:</strong> {formatFileSize(selectedBilde.storrelse)}</div>
                  <div><strong>Type:</strong> {selectedBilde.mimeType}</div>
                  <div><strong>Opprettet:</strong> {formatDate(selectedBilde.opprettet)}</div>
                  {selectedBilde.tags.length > 0 && (
                    <div><strong>Tags:</strong> {selectedBilde.tags.join(', ')}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(selectedBilde.id)}
                  className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors ${
                    deleteConfirmId === selectedBilde.id 
                      ? 'bg-red-700 text-white hover:bg-red-800' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <FaTrash /> {deleteConfirmId === selectedBilde.id ? 'Er du sikker?' : 'Slett'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-1 text-gray-500">
              Velg et bilde for å se detaljer
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-2 py-1 border-b">
              <h2 className="text-xl font-bold">Last opp nytt bilde</h2>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewImage(null);
                  setSelectedFile(null);
                  setUploadForm({ navn: '', beskrivelse: '', tags: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="px-2 py-1 cards-spacing-vertical">
              {/* File input */}
              <div>
                <label className="block text-sm font-medium mb-2">Velg fil</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInput}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              {/* Preview */}
              {previewImage && (
                <div className="border rounded-lg px-2 py-1 bg-gray-50">
                  <img 
                    src={previewImage} 
                    alt="Forhåndsvisning" 
                    className="w-32 h-32 object-cover mx-auto border rounded"
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 cards-spacing-grid">
                <div>
                  <label className="block text-sm font-medium mb-2">Navn</label>
                  <input
                    type="text"
                    value={uploadForm.navn}
                    onChange={e => setUploadForm(prev => ({ ...prev, navn: e.target.value }))}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Navn på bildet..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (kommaseparert)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={e => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full border rounded px-2 py-1"
                    placeholder="trafikkskilt, bil, sikkerhet..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Beskrivelse</label>
                  <textarea
                    value={uploadForm.beskrivelse}
                    onChange={e => setUploadForm(prev => ({ ...prev, beskrivelse: e.target.value }))}
                    className="w-full border rounded px-2 py-1 h-20"
                    placeholder="Beskrivelse av bildet..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-2 py-1 border-t">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewImage(null);
                  setSelectedFile(null);
                  setUploadForm({ navn: '', beskrivelse: '', tags: '' });
                }}
                className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
              >
                Avbryt
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Laster opp...' : 'Last opp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
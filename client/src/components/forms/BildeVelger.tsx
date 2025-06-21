import React, { useState, useEffect, useCallback } from 'react';
import { log } from '../../utils/logger';
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

interface BildeVelgerProps {
  valgtBilde?: string;
  onVelgBilde: (url: string) => void;
  onLukkModal: () => void;
}

export default function BildeVelger({ valgtBilde, onVelgBilde, onLukkModal }: BildeVelgerProps) {
  const [bilder, setBilder] = useState<Bilde[]>([]);
  const [loading, setLoading] = useState(true);
  const [sokTekst, setSokTekst] = useState('');
  const [activeTab, setActiveTab] = useState<'bibliotek' | 'upload'>('bibliotek');
  
  // Upload state
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    navn: '',
    beskrivelse: '',
    tags: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filstorrelser, setFilstorrelser] = useState<string[]>(['Bytes', 'KB', 'MB', 'GB']); // Fallback

  const lastBilder = useCallback(async () => {
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
      log.apiError('/api/bilder', error);
    }
    setLoading(false);
  }, [sokTekst]);

  useEffect(() => {
    lastBilder();
    hentFilstorrelser();
  }, [lastBilder]);

  const hentFilstorrelser = async () => {
    try {
      const enheter = await referenceService.getFilstorrelser('lang');
      setFilstorrelser(enheter);
    } catch (error) {
      console.error('Feil ved henting av filstørrelse-enheter:', error);
      // Beholder fallback-verdier ved feil
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('bilde', file);
    formData.append('navn', uploadForm.navn || file.name);
    formData.append('beskrivelse', uploadForm.beskrivelse);
    formData.append('tags', uploadForm.tags);

    try {
      log.debug('Starter bildeupplasting', { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size 
      });
      
      const response = await fetch('/api/bilder/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      log.debug('Upload respons mottatt', { status: response.status });

      if (response.ok) {
        const nyttBilde = await response.json();
        log.info('Bildeupplasting vellykket', { imageId: nyttBilde.id, imageName: nyttBilde.navn });
        setBilder(prev => [nyttBilde, ...prev]);
        setUploadForm({ navn: '', beskrivelse: '', tags: '' });
        setPreviewImage(null);
        setSelectedFile(null);
        
        // Automatically select the newly uploaded image
        onVelgBilde(nyttBilde.url);
        
        // Switch to library tab to show the uploaded image
        setActiveTab('bibliotek');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ukjent feil' }));
        log.error('Bildeupplasting feilet', { 
          status: response.status, 
          error: errorData.error || 'Ukjent feil' 
        });
        alert(`Feil ved opplasting av bilde: ${errorData.error || 'Ukjent feil'}`);
      }
    } catch (error) {
      log.error('Nettverksfeil ved bildeupplasting', error);
      alert(`Feil ved opplasting av bilde: ${error instanceof Error ? error.message : 'Nettverksfeil'}`);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const file = imageFiles[0];
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, navn: prev.navn || file.name }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, navn: prev.navn || file.name }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSelectedFile = async () => {
    if (!selectedFile) return;
    await handleFileUpload(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${filstorrelser[0] || 'Bytes'}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const enhetsIndex = Math.min(i, filstorrelser.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + filstorrelser[enhetsIndex];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-2 py-1 border-b">
          <h2 className="text-xl font-bold">Velg illustrasjonsbilde</h2>
          <button 
            onClick={onLukkModal}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('bibliotek')}
            className={`px-6 py-3 ${activeTab === 'bibliotek' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Bildebibliotek
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Last opp nytt bilde
          </button>
        </div>

        <div className="px-2 py-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'bibliotek' ? (
            <>
              {/* Søk */}
              <div className="mb-4">
                <input
                  type="text"
                  value={sokTekst}
                  onChange={e => setSokTekst(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Søk etter bilder..."
                />
              </div>

              {/* Bildegalleri */}
              {loading ? (
                <div className="text-center py-1">Laster bilder...</div>
              ) : bilder.length === 0 ? (
                <div className="text-center py-1 text-gray-500">
                  Ingen bilder funnet
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 cards-spacing-grid">
                  {bilder.map(bilde => (
                    <div 
                      key={bilde.id}
                      onClick={() => onVelgBilde(bilde.url)}
                      className={`cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                        valgtBilde === bilde.url ? 'ring-2 ring-blue-500' : ''
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
            </>
          ) : (
            /* Upload tab */
            <div className="cards-spacing-vertical">
              {/* Drag & drop område */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? (
                  <div>Laster opp...</div>
                ) : (
                  <>
                    <div className="text-4xl mb-4">📁</div>
                    <div className="text-lg mb-2">Dra og slipp bilde her</div>
                    <div className="text-gray-500 mb-4">eller</div>
                    <label className="bg-blue-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-700">
                      Velg fil
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Metadata form */}
              <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Beskrivelse</label>
                  <textarea
                    value={uploadForm.beskrivelse}
                    onChange={e => setUploadForm(prev => ({ ...prev, beskrivelse: e.target.value }))}
                    className="w-full border rounded px-2 py-1 h-20"
                    placeholder="Beskrivelse av bildet..."
                  />
                </div>
              </div>

              {/* Forhåndsvisning og upload */}
              {previewImage && selectedFile && (
                <div className="border rounded-lg px-2 py-1 bg-gray-50">
                  <h4 className="text-sm font-medium mb-3">Forhåndsvisning</h4>
                  <div className="flex cards-spacing-grid items-start">
                    <div className="flex-shrink-0">
                      <img 
                        src={previewImage} 
                        alt="Forhåndsvisning" 
                        className="w-32 h-32 object-cover border rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Fil:</strong> {selectedFile.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Størrelse:</strong> {formatFileSize(selectedFile.size)}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        <strong>Type:</strong> {selectedFile.type}
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleUploadSelectedFile}
                          disabled={uploading}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {uploading ? 'Laster opp...' : 'Last opp bilde'}
                        </button>
                        <button
                          onClick={() => {
                            setPreviewImage(null);
                            setSelectedFile(null);
                            setUploadForm({ navn: '', beskrivelse: '', tags: '' });
                          }}
                          className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          Fjern
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-2 py-1 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {valgtBilde ? 'Bilde valgt' : 'Ingen bilde valgt'}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onLukkModal}
              className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
            >
              Avbryt
            </button>
            {valgtBilde && (
              <button
                onClick={() => {
                  onVelgBilde(valgtBilde);
                  onLukkModal();
                }}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Bruk valgte bilde
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
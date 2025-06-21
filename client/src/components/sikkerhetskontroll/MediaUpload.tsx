import React, { useState, useRef } from 'react';
import { FaUpload, FaImage, FaVideo, FaVolumeUp, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

interface MediaUploadProps {
  sporsmalId: number;
  onUploadComplete?: (mediaId: number) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // MB
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  uploading: boolean;
  error?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  sporsmalId, 
  onUploadComplete,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxFileSize = 50 // 50MB
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'IMAGE' | 'VIDEO' | 'AUDIO' => {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.startsWith('audio/')) return 'AUDIO';
    return 'IMAGE'; // fallback
  };

  const validateFile = (file: File): string | null => {
    // Størrelse sjekk
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Filen er for stor. Maks størrelse er ${maxFileSize}MB.`;
    }

    // Type sjekk
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'video/*') return file.type.startsWith('video/');
      if (type === 'audio/*') return file.type.startsWith('audio/');
      return file.type === type;
    });

    if (!isValidType) {
      return 'Ugyldig filtype. Støttede formater: bilder, videoer, lyd.';
    }

    return null;
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }

      const preview = await createPreview(file);
      const uploadedFile: UploadedFile = {
        file,
        preview,
        type: getFileType(file),
        uploading: true
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Start upload
      uploadFile(file, uploadedFiles.length);
    }
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('sporsmalId', sporsmalId.toString());
      formData.append('type', getFileType(file));

      const response = await fetch('/api/sikkerhetskontroll-laering/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload feilet');
      }

      const result = await response.json();
      
      // Oppdater fil status
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false } : f
      ));

      if (onUploadComplete) {
        onUploadComplete(result.id);
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Upload feilet' 
        } : f
      ));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: 'IMAGE' | 'VIDEO' | 'AUDIO') => {
    switch (type) {
      case 'IMAGE': return FaImage;
      case 'VIDEO': return FaVideo;
      case 'AUDIO': return FaVolumeUp;
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Upload område */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Last opp media til spørsmålet
        </h3>
        <p className="text-gray-600 mb-4">
          Dra og slipp filer her, eller klikk for å velge
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FaImage className="w-4 h-4" />
            <span>Bilder</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaVideo className="w-4 h-4" />
            <span>Videoer</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaVolumeUp className="w-4 h-4" />
            <span>Lyd</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Maks {maxFileSize}MB per fil
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Opplastede filer */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-8">
          <h4 className="font-medium text-gray-900">Opplastede filer</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
            {uploadedFiles.map((uploadedFile, index) => {
              const FileIcon = getFileIcon(uploadedFile.type);
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 relative">
                    {uploadedFile.preview ? (
                      uploadedFile.type === 'IMAGE' ? (
                        <img 
                          src={uploadedFile.preview} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video 
                          src={uploadedFile.preview}
                          className="w-full h-full object-cover"
                          controls={false}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      {uploadedFile.uploading ? (
                        <FaSpinner className="w-6 h-6 text-white animate-spin" />
                      ) : uploadedFile.error ? (
                        <FaTimes className="w-6 h-6 text-red-500" />
                      ) : (
                        <FaCheck className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-2 py-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {uploadedFile.error && (
                          <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for god media</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Bilder: Høy oppløsning, god belysning, tydelige detaljer</li>
          <li>• Videoer: Stabil oppttak, god lyd, ikke for lange (maks 2-3 min)</li>
          <li>• Lyd: Tydelig tale, minimalt bakgrunnsstøy</li>
          <li>• Velg filnavn som beskriver innholdet</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaUpload; 
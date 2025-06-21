import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../design-system";
import { 
  PencilIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { avtegningService, SigningDocument, AvtegningFilter } from '../../services/avtegning.service';

const SikkerhetskontrollAvtegning: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<SigningDocument | null>(null);
  const [isSigningMode, setIsSigningMode] = useState(false);
  const [signature, setSignature] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'signed'>('all');
  const [signingDocuments, setSigningDocuments] = useState<SigningDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    lastDokumenter();
  }, [filterStatus]);

  const lastDokumenter = async () => {
    try {
      setLoading(true);
      setError(null);
      const filter: AvtegningFilter = { status: filterStatus };
      const dokumenter = await avtegningService.hentDokumenter(filter);
      setSigningDocuments(dokumenter);
    } catch (err) {
      setError('Kunne ikke laste dokumenter');
      console.error('Feil ved lasting av dokumenter:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = signingDocuments.filter(doc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return doc.status === 'pending';
    if (filterStatus === 'signed') return doc.status === 'signed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'signed': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safety_check': return <CheckCircleIcon className="h-5 w-5" />;
      case 'inspection': return <EyeIcon className="h-5 w-5" />;
      case 'audit': return <DocumentTextIcon className="h-5 w-5" />;
      default: return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2937';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    canvasRef.current.getContext('2d')?.beginPath();
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !selectedDocument) return;
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    
    try {
      const success = await avtegningService.lagreSignatur(
        selectedDocument.id, 
        signatureData, 
        'Bruker' // Dette bør komme fra autentisert bruker
      );
      
      if (success) {
        alert('Avtegning lagret!');
        setIsSigningMode(false);
        clearSignature();
        lastDokumenter(); // Oppdater listen
      } else {
        alert('Kunne ikke lagre avtegning');
      }
    } catch (error) {
      console.error('Feil ved lagring av signatur:', error);
      alert('Kunne ikke lagre avtegning');
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Digital Avtegning</h1>
        <p className="text-gray-600 mt-2">
          Digital signering av sikkerhetskontroller og rapporter
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Alle dokumenter
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Venter avtegning
          </button>
          <button
            onClick={() => setFilterStatus('signed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filterStatus === 'signed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Signert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {/* Document List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Dokumenter for avtegning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cards-spacing-vertical">
                {filteredDocuments.map((doc) => {
                  const daysRemaining = getDaysRemaining(doc.dueDate);
                  const isSelected = selectedDocument?.id === doc.id;
                  
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-blue-500 mt-1">
                            {getTypeIcon(doc.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{doc.title}</h3>
                            <p className="text-sm text-gray-600">{doc.company}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                                {doc.status === 'pending' ? 'Venter' : 
                                 doc.status === 'signed' ? 'Signert' : 
                                 doc.status === 'rejected' ? 'Avvist' : 'Utløpt'}
                              </span>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getUrgencyColor(doc.urgency)}`}>
                                {doc.urgency === 'high' ? 'Høy' : doc.urgency === 'medium' ? 'Medium' : 'Lav'} prioritet
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {daysRemaining > 0 ? `${daysRemaining} dager igjen` : 
                                 daysRemaining === 0 ? 'Forfaller i dag' : 
                                 `${Math.abs(daysRemaining)} dager forsinket`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {doc.completedSignatures.length} av {doc.requiredSignatures.filter(s => s.required).length} signert
                          </p>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${(doc.completedSignatures.length / doc.requiredSignatures.filter(s => s.required).length) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Details & Signing */}
        <div>
          {selectedDocument ? (
            <div className="cards-spacing-vertical">
              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DocumentDuplicateIcon className="h-5 w-5" />
                    <span>Dokumentdetaljer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="cards-spacing-vertical">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedDocument.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedDocument.company}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                    <div>
                      <span className="text-gray-500">Opprettet:</span>
                      <p className="font-medium">{selectedDocument.createdDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Frist:</span>
                      <p className="font-medium">{selectedDocument.dueDate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nødvendige signaturer:</h4>
                    <div className="space-y-6">
                      {selectedDocument.requiredSignatures.map((req, index) => {
                        const completed = selectedDocument.completedSignatures.find(c => c.role === req.role);
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{req.role} - {req.name}</span>
                            {completed ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ClockIcon className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsSigningMode(true)}
                      disabled={selectedDocument.status === 'signed'}
                      className="flex-1 flex items-center justify-center px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Signer dokument
                    </button>
                    <button onClick={() => console.log('Button clicked')} className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Signing Interface */}
              {isSigningMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PencilIcon className="h-5 w-5" />
                      <span>Digital signatur</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="cards-spacing-vertical">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tegn din signatur nedenfor:
                      </label>
                      <div className="border border-gray-300 rounded-md">
                        <canvas
                          ref={canvasRef}
                          width={280}
                          height={120}
                          className="w-full cursor-crosshair bg-white rounded-md"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={clearSignature}
                        className="flex-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <ArrowPathIcon className="mr-2 h-4 w-4" />
                        Nullstill
                      </button>
                      <button
                        onClick={saveSignature}
                        className="flex-1 px-2 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Lagre signatur
                      </button>
                    </div>

                    <button
                      onClick={() => setIsSigningMode(false)}
                      className="w-full px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Avbryt
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Velg et dokument</h3>
                <p className="mt-2 text-gray-500">
                  Velg et dokument fra listen for å se detaljer og signere.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Venter signatur</p>
              <p className="text-2xl font-bold text-orange-600">
                {signingDocuments.filter(d => d.status === 'pending').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Signert i dag</p>
              <p className="text-2xl font-bold text-green-600">4</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Forfaller snart</p>
              <p className="text-2xl font-bold text-red-600">
                {signingDocuments.filter(d => getDaysRemaining(d.dueDate) <= 2).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt dokumenter</p>
              <p className="text-2xl font-bold">{signingDocuments.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SikkerhetskontrollAvtegning; 
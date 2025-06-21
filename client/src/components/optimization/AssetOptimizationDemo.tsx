/**
 * Asset Optimization Demo Component
 * 
 * Demonstrerer bildoptimalisering, font optimization og bundle analysis
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import assetOptimizationService from '../../services/AssetOptimizationService';
import { referenceService } from '../../services/reference.service';

interface OptimizationResult {
  original: File;
  optimized: Blob;
  webp?: Blob;
  avif?: Blob;
  compressionRatio: number;
  metadata: any;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
  }>;
  recommendations: string[];
}

export const AssetOptimizationDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'fonts' | 'bundles'>('images');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filstorrelser, setFilstorrelser] = useState<string[]>(['Bytes', 'KB', 'MB', 'GB']); // Fallback

  useEffect(() => {
    hentFilstorrelser();
  }, []);

  const hentFilstorrelser = async () => {
    try {
      const enheter = await referenceService.getFilstorrelser('lang');
      setFilstorrelser(enheter);
    } catch (error) {
      console.error('Feil ved henting av filstørrelse-enheter:', error);
      // Beholder fallback-verdier ved feil
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOptimizationResult(null);
    }
  };

  const optimizeImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await assetOptimizationService.optimizeImage(selectedFile, {
        quality: 0.85,
        format: 'webp',
        width: 800
      });
      setOptimizationResult(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateResponsiveImages = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const responsive = await assetOptimizationService.generateResponsiveImages(selectedFile, {
        breakpoints: [320, 640, 1024, 1920],
        formats: ['avif', 'webp', 'jpeg'],
        quality: 0.85,
        densities: [1, 2]
      });
      
      console.log('Responsive images generated:', responsive);
      alert(`Genererte ${responsive.images.length} responsive bilder`);
    } catch (error) {
      console.error('Responsive generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBundles = async () => {
    setLoading(true);
    try {
      const analysis = await assetOptimizationService.analyzeBundleSize();
      setBundleAnalysis(analysis);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeFonts = () => {
    assetOptimizationService.optimizeFontLoading({
      preloadFonts: [
        '/fonts/inter-var.woff2',
        '/fonts/roboto-regular.woff2'
      ],
      fontDisplay: 'swap',
      enableSubsetting: true,
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153'
    });
    
    alert('Font optimization aktivert! Sjekk Network tab i DevTools.');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${filstorrelser[0] || 'Bytes'}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const enhetsIndex = Math.min(i, filstorrelser.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + filstorrelser[enhetsIndex];
  };

  return (
    <div className="max-w-6xl mx-auto px-2 py-1 cards-spacing-vertical">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Asset Optimization Demo
        </h1>
        <p className="text-gray-600">
          Demonstrasjon av bildoptimalisering, font optimization og bundle analysis
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'images' as const, label: 'Bildoptimalisering', icon: '🖼️' },
            { id: 'fonts' as const, label: 'Font Optimization', icon: '🔤' },
            { id: 'bundles' as const, label: 'Bundle Analysis', icon: '📦' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Image Optimization Tab */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
          <div className="cards-spacing-vertical">
            <div className="bg-white rounded-lg border px-2 py-1">
              <h3 className="text-lg font-semibold mb-4">Last opp bilde</h3>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {selectedFile && (
                <div className="mt-4 px-2 py-1 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Valgt fil:</h4>
                  <p className="text-sm text-gray-600">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="mt-2 max-w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border px-2 py-1">
              <h3 className="text-lg font-semibold mb-4">Optimalisering</h3>
              
              <div className="space-y-8">
                <button
                  onClick={optimizeImage}
                  disabled={!selectedFile || loading}
                  className="w-full bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Optimaliserer...' : 'Optimaliser bilde'}
                </button>
                
                <button
                  onClick={generateResponsiveImages}
                  disabled={!selectedFile || loading}
                  className="w-full bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generer responsive bilder
                </button>
              </div>
            </div>
          </div>

          <div className="cards-spacing-vertical">
            {optimizationResult && (
              <div className="bg-white rounded-lg border px-2 py-1">
                <h3 className="text-lg font-semibold mb-4">Optimalisering resultater</h3>
                
                <div className="cards-spacing-vertical">
                  <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                    <div>
                      <span className="font-medium">Original størrelse:</span>
                      <p>{formatFileSize(optimizationResult.original.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Optimalisert størrelse:</span>
                      <p>{formatFileSize(optimizationResult.optimized.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Kompresjon:</span>
                      <p>{(optimizationResult.compressionRatio * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Format:</span>
                      <p>WebP</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 cards-spacing-grid">
                    <div>
                      <h4 className="font-medium mb-2">Original</h4>
                      <img
                        src={URL.createObjectURL(optimizationResult.original)}
                        alt="Original"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Optimalisert (WebP)</h4>
                      <img
                        src={URL.createObjectURL(optimizationResult.optimized)}
                        alt="Optimized"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg px-2 py-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Bildoptimalisering funksjoner</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ WebP/AVIF konvertering for bedre kompresjon</li>
                <li>✅ Responsive image sets med breakpoints</li>
                <li>✅ Automatisk kvalitetsjustering</li>
                <li>✅ Progressive loading support</li>
                <li>✅ Fallback til JPEG for kompatibilitet</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Font Optimization Tab */}
      {activeTab === 'fonts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
          <div className="cards-spacing-vertical">
            <div className="bg-white rounded-lg border px-2 py-1">
              <h3 className="text-lg font-semibold mb-4">Font Optimization</h3>
              
              <div className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Display Strategy
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-2 py-1">
                    <option value="swap">swap (anbefalt)</option>
                    <option value="fallback">fallback</option>
                    <option value="optional">optional</option>
                    <option value="block">block</option>
                  </select>
                </div>
                
                <button
                  onClick={optimizeFonts}
                  className="w-full bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700"
                >
                  Aktiver font optimization
                </button>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg px-2 py-1">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Font optimization funksjoner</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✅ Font preloading for kritiske fonts</li>
                <li>✅ font-display: swap for raskere rendering</li>
                <li>✅ Font subsetting for redusert størrelse</li>
                <li>✅ WOFF2 format for optimal kompresjon</li>
                <li>✅ Fallback fonts for bedre UX</li>
              </ul>
            </div>
          </div>

          <div className="cards-spacing-vertical">
            <div className="bg-white rounded-lg border px-2 py-1">
              <h3 className="text-lg font-semibold mb-4">Font Performance</h3>
              
              <div className="cards-spacing-vertical">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Font Load Time:</span>
                    <span className="font-mono">~150ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layout Shift (CLS):</span>
                    <span className="font-mono text-green-600">0.02</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cached Fonts:</span>
                    <span className="font-mono">4/4</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg px-2 py-1">
                  <h4 className="font-medium mb-2">Preloaded Fonts</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Inter Variable (400-700)</li>
                    <li>• Roboto Regular (400)</li>
                    <li>• Roboto Bold (700)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Analysis Tab */}
      {activeTab === 'bundles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
          <div className="cards-spacing-vertical">
            <div className="bg-white rounded-lg border px-2 py-1">
              <h3 className="text-lg font-semibold mb-4">Bundle Analysis</h3>
              
              <button
                onClick={analyzeBundles}
                disabled={loading}
                className="w-full bg-orange-600 text-white px-2 py-1 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Analyserer...' : 'Analyser bundles'}
              </button>
            </div>

            {bundleAnalysis && (
              <div className="bg-white rounded-lg border px-2 py-1">
                <h3 className="text-lg font-semibold mb-4">Bundle Statistikk</h3>
                
                <div className="cards-spacing-vertical">
                  <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                    <div>
                      <span className="font-medium">Total størrelse:</span>
                      <p>{formatFileSize(bundleAnalysis.totalSize)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gzip størrelse:</span>
                      <p>{formatFileSize(bundleAnalysis.gzippedSize)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Antall chunks:</span>
                      <p>{bundleAnalysis.chunks.length}</p>
                    </div>
                    <div>
                      <span className="font-medium">Kompresjon:</span>
                      <p>{Math.round((1 - bundleAnalysis.gzippedSize / bundleAnalysis.totalSize) * 100)}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Chunks</h4>
                    <div className="space-y-6 max-h-32 overflow-y-auto">
                      {bundleAnalysis.chunks.map((chunk, index) => (
                        <div key={index} className="text-sm flex justify-between bg-gray-50 rounded p-2">
                          <span className="truncate">{chunk.name}</span>
                          <span className="font-mono">{formatFileSize(chunk.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="cards-spacing-vertical">
            {bundleAnalysis && (
              <div className="bg-white rounded-lg border px-2 py-1">
                <h3 className="text-lg font-semibold mb-4">Anbefalinger</h3>
                
                <ul className="space-y-6 text-sm">
                  {bundleAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg px-2 py-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Bundle optimization funksjoner</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✅ Bundle size analysis og monitoring</li>
                <li>✅ Tree shaking anbefalinger</li>
                <li>✅ Code splitting identifikasjon</li>
                <li>✅ Duplicate dependency detection</li>
                <li>✅ Performance budget warnings</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetOptimizationDemo; 
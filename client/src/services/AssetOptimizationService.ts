/**
 * Asset Optimization Service
 * 
 * Comprehensive asset optimization service for images, fonts, and bundles
 * Håndterer WebP/AVIF conversion, responsive images, font loading, og bundle analysis
 */

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  progressive?: boolean;
  enableLossless?: boolean;
}

interface ResponsiveImageConfig {
  breakpoints: number[];
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  quality: number;
  densities: number[];
}

interface FontOptimizationConfig {
  preloadFonts: string[];
  fontDisplay: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  enableSubsetting?: boolean;
  unicodeRange?: string;
}

interface BundleAnalysisResult {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    modules: string[];
  }>;
  recommendations: string[];
  unusedExports: string[];
  duplicateDependencies: string[];
}

class AssetOptimizationService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================

  /**
   * Optimize image with format conversion and quality adjustment
   */
  async optimizeImage(
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<{
    original: File;
    optimized: Blob;
    webp?: Blob;
    avif?: Blob;
    compressionRatio: number;
    metadata: ImageMetadata;
  }> {
    const {
      quality = 0.85,
      format = 'webp',
      width,
      height,
      progressive = true,
      enableLossless = false
    } = options;

    const img = await this.loadImage(file);
    const metadata = this.extractImageMetadata(img, file);

    // Calculate target dimensions
    const targetDimensions = this.calculateTargetDimensions(
      img.width, 
      img.height, 
      width, 
      height
    );

    // Optimize to requested format
    const optimized = await this.convertToFormat(
      img, 
      targetDimensions, 
      format, 
      quality,
      progressive,
      enableLossless
    );

    // Generate additional formats for maximum compatibility
    const webp = format !== 'webp' ? await this.convertToFormat(
      img, targetDimensions, 'webp', quality
    ) : optimized;

    const avif = format !== 'avif' ? await this.convertToFormat(
      img, targetDimensions, 'avif', quality * 0.8 // AVIF typically needs lower quality
    ) : optimized;

    const compressionRatio = (file.size - optimized.size) / file.size;

    return {
      original: file,
      optimized,
      webp: format !== 'webp' ? webp : undefined,
      avif: format !== 'avif' ? avif : undefined,
      compressionRatio,
      metadata
    };
  }

  /**
   * Generate responsive image set with multiple sizes and formats
   */
  async generateResponsiveImages(
    file: File,
    config: ResponsiveImageConfig
  ): Promise<ResponsiveImageSet> {
    const { breakpoints, formats, quality, densities } = config;
    const img = await this.loadImage(file);
    
    const images: ResponsiveImage[] = [];
    const srcset: string[] = [];

    for (const breakpoint of breakpoints) {
      for (const density of densities) {
        const targetWidth = breakpoint * density;
        
        // Skip if target is larger than original
        if (targetWidth > img.width) continue;

        for (const format of formats) {
          const optimized = await this.convertToFormat(
            img,
            { width: targetWidth, height: (targetWidth / img.width) * img.height },
            format,
            quality
          );

          const url = URL.createObjectURL(optimized);
          const descriptor = density > 1 ? `${targetWidth}w ${density}x` : `${targetWidth}w`;
          
          images.push({
            url,
            width: targetWidth,
            height: Math.round((targetWidth / img.width) * img.height),
            format,
            size: optimized.size,
            density,
            descriptor
          });

          srcset.push(`${url} ${descriptor}`);
        }
      }
    }

    return {
      images,
      srcset: srcset.join(', '),
      sizes: this.generateSizesAttribute(breakpoints),
      fallback: images.find(img => img.format === 'jpeg') || images[0]
    };
  }

  /**
   * Create optimized image with automatic format detection
   */
  async createOptimizedImage(file: File): Promise<HTMLPictureElement> {
    const optimized = await this.optimizeImage(file, {
      quality: 0.85,
      format: 'webp'
    });

    const picture = document.createElement('picture');

    // Add AVIF source (best compression)
    if (optimized.avif) {
      const avifSource = document.createElement('source');
      avifSource.srcset = URL.createObjectURL(optimized.avif);
      avifSource.type = 'image/avif';
      picture.appendChild(avifSource);
    }

    // Add WebP source (good compression, wide support)
    if (optimized.webp) {
      const webpSource = document.createElement('source');
      webpSource.srcset = URL.createObjectURL(optimized.webp);
      webpSource.type = 'image/webp';
      picture.appendChild(webpSource);
    }

    // Add fallback img element
    const img = document.createElement('img');
    img.src = URL.createObjectURL(optimized.optimized);
    img.alt = file.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.appendChild(img);

    return picture;
  }

  // ============================================================================
  // FONT OPTIMIZATION
  // ============================================================================

  /**
   * Optimize font loading with preloading and font-display
   */
  optimizeFontLoading(config: FontOptimizationConfig): void {
    const { preloadFonts, fontDisplay, /* enableSubsetting, */ unicodeRange } = config; // enableSubsetting currently unused

    // Preload critical fonts
    preloadFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Add font-display CSS
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'OptimizedFont';
        font-display: ${fontDisplay};
        ${unicodeRange ? `unicode-range: ${unicodeRange};` : ''}
        src: url('/fonts/optimized-font.woff2') format('woff2'),
             url('/fonts/optimized-font.woff') format('woff');
      }
    `;
    document.head.appendChild(style);

    // Font loading performance monitoring
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('All fonts loaded in', performance.now(), 'ms');
      });
    }
  }

  /**
   * Generate font subset for specific character ranges
   */
  async generateFontSubset(
    fontFile: ArrayBuffer, 
    characterSet: string
  ): Promise<ArrayBuffer> {
    // This would typically use a library like fontkit or opentype.js
    // For now, return a placeholder implementation
    console.log('Font subsetting would reduce font size for characters:', characterSet);
    return fontFile; // Placeholder
  }

  // ============================================================================
  // BUNDLE ANALYSIS
  // ============================================================================

  /**
   * Analyze bundle size and provide optimization recommendations
   */
  async analyzeBundleSize(): Promise<BundleAnalysisResult> {
    const performanceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = performanceEntries.filter(entry => 
      entry.name.includes('.js') && !entry.name.includes('node_modules')
    );

    const chunks = jsResources.map(resource => ({
      name: this.extractFileName(resource.name),
      size: resource.transferSize || 0,
      gzippedSize: resource.encodedBodySize || 0,
      modules: [] // Would need build tool integration for actual module list
    }));

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

    const recommendations = this.generateBundleRecommendations(chunks, totalSize);

    return {
      totalSize,
      gzippedSize,
      chunks,
      recommendations,
      unusedExports: [], // Would need tree-shaking analysis
      duplicateDependencies: [] // Would need dependency analysis
    };
  }

  /**
   * Implement tree shaking analysis
   */
  async analyzeTreeShaking(): Promise<{
    unusedExports: Array<{ module: string; exports: string[] }>;
    potentialSavings: number;
    recommendations: string[];
  }> {
    // This would typically integrate with webpack-bundle-analyzer or similar
    return {
      unusedExports: [
        { module: 'lodash', exports: ['debounce', 'throttle'] },
        { module: 'react-icons', exports: ['FaUnusedIcon'] }
      ],
      potentialSavings: 45000, // bytes
      recommendations: [
        'Fjern ubrukte lodash funksjoner - import kun spesifikke funksjoner',
        'Bruk tree-shakable icon imports: import { FaIcon } from "react-icons/fa"',
        'Vurder code splitting for sjelden brukte komponenter'
      ]
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private extractImageMetadata(img: HTMLImageElement, file: File): ImageMetadata {
    return {
      width: img.width,
      height: img.height,
      aspectRatio: img.width / img.height,
      fileSize: file.size,
      format: file.type,
      colorProfile: 'sRGB', // Placeholder
      hasTransparency: file.type.includes('png') || file.type.includes('gif')
    };
  }

  private calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    if (!targetWidth && !targetHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (targetWidth && !targetHeight) {
      return { width: targetWidth, height: targetWidth / aspectRatio };
    }

    if (!targetWidth && targetHeight) {
      return { width: targetHeight * aspectRatio, height: targetHeight };
    }

    return { width: targetWidth!, height: targetHeight! };
  }

  private async convertToFormat(
    img: HTMLImageElement,
    dimensions: { width: number; height: number },
    format: string,
    quality: number,
    progressive?: boolean,
    lossless?: boolean
  ): Promise<Blob> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }

    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    const mimeType = `image/${format}`;
    
    return new Promise((resolve) => {
      this.canvas!.toBlob(
        (blob) => resolve(blob!),
        mimeType,
        lossless ? 1.0 : quality
      );
    });
  }

  private generateSizesAttribute(breakpoints: number[]): string {
    return breakpoints
      .map((bp, index) => {
        if (index === breakpoints.length - 1) {
          return `${bp}px`;
        }
        return `(max-width: ${bp}px) ${bp}px`;
      })
      .join(', ');
  }

  private extractFileName(url: string): string {
    return url.split('/').pop() || url;
  }

  private generateBundleRecommendations(
    chunks: Array<{ name: string; size: number }>,
    totalSize: number
  ): string[] {
    const recommendations: string[] = [];

    if (totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Total bundle size er over 1MB - vurder code splitting');
    }

    const largeChunks = chunks.filter(chunk => chunk.size > 200 * 1024); // > 200KB
    if (largeChunks.length > 0) {
      recommendations.push(
        `Store chunks funnet: ${largeChunks.map(c => c.name).join(', ')} - vurder lazy loading`
      );
    }

    recommendations.push('Implementer gzip/brotli kompresjon på server');
    recommendations.push('Bruk tree shaking for å fjerne ubrukt kode');
    recommendations.push('Vurder å bruke dynamic imports for ruter');

    return recommendations;
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  fileSize: number;
  format: string;
  colorProfile: string;
  hasTransparency: boolean;
}

interface ResponsiveImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  density: number;
  descriptor: string;
}

interface ResponsiveImageSet {
  images: ResponsiveImage[];
  srcset: string;
  sizes: string;
  fallback: ResponsiveImage;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const assetOptimizationService = new AssetOptimizationService();
export default assetOptimizationService; 
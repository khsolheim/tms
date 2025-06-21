// File upload validation utilities
export interface FileValidationOptions {
  maxSize?: number; // I bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  requireImageDimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  metadata?: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
  };
}

export class FileValidator {
  // Standard MIME type grupper
  static readonly MIME_TYPES = {
    images: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    archives: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip'
    ]
  };

  // Standard størrelsesgrenser (i bytes)
  static readonly SIZE_LIMITS = {
    small: 1 * 1024 * 1024,    // 1MB
    medium: 5 * 1024 * 1024,   // 5MB
    large: 10 * 1024 * 1024,   // 10MB
    xlarge: 50 * 1024 * 1024   // 50MB
  };

  /**
   * Hovedvalidering for filer
   */
  static async validateFile(
    file: File, 
    options: FileValidationOptions = {}
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Standard innstillinger
    const {
      maxSize = this.SIZE_LIMITS.medium,
      allowedMimeTypes = [...this.MIME_TYPES.images, ...this.MIME_TYPES.documents],
      allowedExtensions,
      requireImageDimensions
    } = options;

    // Valider filstørrelse
    if (file.size > maxSize) {
      errors.push(`Filen er for stor. Maksimal størrelse: ${this.formatFileSize(maxSize)}`);
    }

    // Valider MIME type
    if (!allowedMimeTypes.includes(file.type)) {
      errors.push(`Filtype ikke tillatt: ${file.type}`);
    }

    // Valider filutvidelse hvis spesifisert
    if (allowedExtensions) {
      const fileExtension = this.getFileExtension(file.name);
      if (!allowedExtensions.includes(fileExtension)) {
        errors.push(`Filutvidelse ikke tillatt: ${fileExtension}`);
      }
    }

    // Sjekk MIME type kontra filutvidelse (sikkerhet)
    const mimeExtensionMatch = this.validateMimeExtensionMatch(file);
    if (!mimeExtensionMatch.isValid) {
      errors.push(mimeExtensionMatch.error!);
    }

    // Valider bildedimensjoner hvis påkrevd
    let dimensions: { width: number; height: number } | undefined;
    if (requireImageDimensions && this.MIME_TYPES.images.includes(file.type)) {
      try {
        dimensions = await this.getImageDimensions(file);
        const dimensionErrors = this.validateImageDimensions(dimensions, requireImageDimensions);
        errors.push(...dimensionErrors);
      } catch (error) {
        errors.push('Kunne ikke lese bildedimensjoner');
      }
    }

    // Virus scanning simulation (placeholder)
    const virusScanResult = await this.simulateVirusScan(file);
    if (!virusScanResult.isClean) {
      errors.push('Filen feilet virus-skanning');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        size: file.size,
        type: file.type,
        dimensions
      }
    };
  }

  /**
   * Validerer MIME type mot filutvidelse for sikkerhet
   */
  static validateMimeExtensionMatch(file: File): { isValid: boolean; error?: string } {
    const extension = this.getFileExtension(file.name).toLowerCase();
    const mimeType = file.type.toLowerCase();

    const mimeExtensionMap: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    };

    const expectedExtensions = mimeExtensionMap[mimeType];
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `MIME type ${mimeType} samsvarer ikke med filutvidelse ${extension}`
      };
    }

    return { isValid: true };
  }

  /**
   * Henter bildedimensjoner
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Kunne ikke laste bildet'));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Validerer bildedimensjoner
   */
  static validateImageDimensions(
    dimensions: { width: number; height: number },
    requirements: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    }
  ): string[] {
    const errors: string[] = [];

    if (requirements.minWidth && dimensions.width < requirements.minWidth) {
      errors.push(`Bildebredde må være minst ${requirements.minWidth}px`);
    }

    if (requirements.maxWidth && dimensions.width > requirements.maxWidth) {
      errors.push(`Bildebredde kan ikke overstige ${requirements.maxWidth}px`);
    }

    if (requirements.minHeight && dimensions.height < requirements.minHeight) {
      errors.push(`Bildehøyde må være minst ${requirements.minHeight}px`);
    }

    if (requirements.maxHeight && dimensions.height > requirements.maxHeight) {
      errors.push(`Bildehøyde kan ikke overstige ${requirements.maxHeight}px`);
    }

    return errors;
  }

  /**
   * Simulerer virus scanning (placeholder)
   */
  static async simulateVirusScan(file: File): Promise<{ isClean: boolean; threat?: string }> {
    // I en ekte implementering ville dette koble til virus scanning API
    // For nå returnerer vi alltid clean
    await new Promise(resolve => setTimeout(resolve, 100)); // Simuler scanning tid
    
    // Simuler detection av kjente farlige filnavn
    const dangerousNames = ['virus.exe', 'malware.bat', 'trojan.scr'];
    if (dangerousNames.some(name => file.name.toLowerCase().includes(name))) {
      return { isClean: false, threat: 'Suspicious filename detected' };
    }

    return { isClean: true };
  }

  /**
   * Henter filutvidelse
   */
  static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  /**
   * Formaterer filstørrelse til lesbart format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Validerer multiple filer
   */
  static async validateMultipleFiles(
    files: FileList | File[],
    options: FileValidationOptions & { maxFiles?: number } = {}
  ): Promise<{
    isValid: boolean;
    results: FileValidationResult[];
    globalErrors: string[];
  }> {
    const fileArray = Array.from(files);
    const globalErrors: string[] = [];

    // Sjekk maksimalt antall filer
    if (options.maxFiles && fileArray.length > options.maxFiles) {
      globalErrors.push(`Maksimalt ${options.maxFiles} filer tillatt`);
    }

    // Valider hver fil
    const results = await Promise.all(
      fileArray.map(file => this.validateFile(file, options))
    );

    const allValid = globalErrors.length === 0 && results.every(result => result.isValid);

    return {
      isValid: allValid,
      results,
      globalErrors
    };
  }
}

// Predefinerte validatorer for vanlige use cases
export const fileValidators = {
  // Profilbilder
  profileImage: (file: File) => FileValidator.validateFile(file, {
    maxSize: FileValidator.SIZE_LIMITS.small,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    requireImageDimensions: {
      minWidth: 100,
      maxWidth: 2000,
      minHeight: 100,
      maxHeight: 2000
    }
  }),

  // Dokumenter (kontrakter, etc.)
  document: (file: File) => FileValidator.validateFile(file, {
    maxSize: FileValidator.SIZE_LIMITS.large,
    allowedMimeTypes: FileValidator.MIME_TYPES.documents
  }),

  // Bilder for bildebibliotek
  libraryImage: (file: File) => FileValidator.validateFile(file, {
    maxSize: FileValidator.SIZE_LIMITS.medium,
    allowedMimeTypes: FileValidator.MIME_TYPES.images,
    requireImageDimensions: {
      minWidth: 200,
      maxWidth: 4000,
      minHeight: 200,
      maxHeight: 4000
    }
  }),

  // CSV import filer
  csvImport: (file: File) => FileValidator.validateFile(file, {
    maxSize: FileValidator.SIZE_LIMITS.medium,
    allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
    allowedExtensions: ['.csv', '.xls', '.xlsx']
  }),

  // Sikkerhetskontroll bilder
  inspectionImage: (file: File) => FileValidator.validateFile(file, {
    maxSize: FileValidator.SIZE_LIMITS.medium,
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    requireImageDimensions: {
      minWidth: 300,
      maxWidth: 3000,
      minHeight: 300,
      maxHeight: 3000
    }
  })
};

// React hook for file validation
export const useFileValidation = () => {
  const validateFiles = async (
    files: FileList | File[],
    validationType: keyof typeof fileValidators | FileValidationOptions
  ) => {
    if (typeof validationType === 'string') {
      const validator = fileValidators[validationType];
      if (!validator) {
        throw new Error(`Ukjent validator type: ${validationType}`);
      }
      
      const fileArray = Array.from(files);
      const results = await Promise.all(fileArray.map(validator));
      
      return {
        isValid: results.every(result => result.isValid),
        results,
        globalErrors: []
      };
    } else {
      return FileValidator.validateMultipleFiles(files, validationType);
    }
  };

  return { validateFiles, FileValidator };
}; 
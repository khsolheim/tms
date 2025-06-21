import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Frontend file validation types
 */
export interface FileValidationConfig {
  allowedTypes: string[];
  maxSize: number; // i bytes
  minSize?: number;
  maxFiles?: number;
  validateDimensions?: {
    min?: { width: number; height: number };
    max?: { width: number; height: number };
  };
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  file: File;
  preview?: string;
  dimensions?: { width: number; height: number };
}

export interface FileValidationState {
  validFiles: FileValidationResult[];
  invalidFiles: FileValidationResult[];
  isValidating: boolean;
  totalSize: number;
}

/**
 * File size limits (consistent with backend)
 */
export const FILE_SIZE_LIMITS = {
  SMALL_IMAGE: 1 * 1024 * 1024,      // 1MB
  LARGE_IMAGE: 5 * 1024 * 1024,      // 5MB
  DOCUMENT: 10 * 1024 * 1024,        // 10MB
  CSV_IMPORT: 50 * 1024 * 1024,      // 50MB
  ARCHIVE: 100 * 1024 * 1024         // 100MB
} as const;

/**
 * Image dimension requirements
 */
export const IMAGE_DIMENSIONS = {
  PROFILE_AVATAR: { min: { width: 100, height: 100 }, max: { width: 2000, height: 2000 } },
  INSPECTION_PHOTO: { min: { width: 300, height: 300 }, max: { width: 4000, height: 4000 } },
  COMPANY_LOGO: { min: { width: 100, height: 100 }, max: { width: 1000, height: 1000 } }
} as const;

/**
 * Predefined validation configs
 */
export const VALIDATION_CONFIGS = {
  profileImage: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: FILE_SIZE_LIMITS.SMALL_IMAGE,
    maxFiles: 1,
    validateDimensions: IMAGE_DIMENSIONS.PROFILE_AVATAR
  },
  inspectionImages: {
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: FILE_SIZE_LIMITS.LARGE_IMAGE,
    maxFiles: 10,
    validateDimensions: IMAGE_DIMENSIONS.INSPECTION_PHOTO
  },
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    maxSize: FILE_SIZE_LIMITS.DOCUMENT,
    maxFiles: 5
  },
  csvImport: {
    allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
    maxSize: FILE_SIZE_LIMITS.CSV_IMPORT,
    maxFiles: 1
  },
  companyLogo: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: FILE_SIZE_LIMITS.SMALL_IMAGE,
    maxFiles: 1,
    validateDimensions: IMAGE_DIMENSIONS.COMPANY_LOGO
  }
} as const;

/**
 * Hook for file validation and upload handling
 */
export const useFileValidation = (config: FileValidationConfig) => {
  const [state, setState] = useState<FileValidationState>({
    validFiles: [],
    invalidFiles: [],
    isValidating: false,
    totalSize: 0
  });

  /**
   * Validate a single file
   */
  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      file
    };

    try {
      // 1. File type validation
      if (!config.allowedTypes.includes(file.type)) {
        result.errors.push(`Filtype ${file.type} er ikke tillatt`);
        result.isValid = false;
      }

      // 2. File size validation
      if (file.size > config.maxSize) {
        const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
        result.errors.push(`Fil er for stor. Maksimum størrelse er ${maxSizeMB}MB`);
        result.isValid = false;
      }

      if (config.minSize && file.size < config.minSize) {
        const minSizeMB = (config.minSize / (1024 * 1024)).toFixed(1);
        result.errors.push(`Fil er for liten. Minimum størrelse er ${minSizeMB}MB`);
        result.isValid = false;
      }

      // 3. Filename validation
      if (!file.name || file.name.trim() === '') {
        result.errors.push('Filnavn er påkrevd');
        result.isValid = false;
      }

      // Check for dangerous filenames
      const dangerousPatterns = [
        /\.\./,                    // Path traversal
        /[<>:"|?*]/,               // Invalid filename characters
        /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
        /^\./,                     // Hidden files starting with .
        /\.(bat|cmd|exe|scr|com|pif|vbs|js|jar|ps1)$/i // Executable files
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(file.name)) {
          result.errors.push('Ugyldig filnavn');
          result.isValid = false;
          break;
        }
      }

      // 4. Image dimension validation
      if (isImage(file.type) && config.validateDimensions) {
        try {
          const dimensions = await getImageDimensions(file);
          result.dimensions = dimensions;

          const { min, max } = config.validateDimensions;
          
          if (min) {
            if (dimensions.width < min.width || dimensions.height < min.height) {
              result.errors.push(`Bilde er for lite. Minimum: ${min.width}x${min.height}px`);
              result.isValid = false;
            }
          }

          if (max) {
            if (dimensions.width > max.width || dimensions.height > max.height) {
              result.errors.push(`Bilde er for stort. Maksimum: ${max.width}x${max.height}px`);
              result.isValid = false;
            }
          }
        } catch (error) {
          result.warnings.push('Kunne ikke validere bildedimensjoner');
        }
      }

      // 5. Generate preview for images
      if (isImage(file.type)) {
        try {
          result.preview = await createImagePreview(file);
        } catch (error) {
          result.warnings.push('Kunne ikke lage forhåndsvisning');
        }
      }

      // 6. CSV validation for import files
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          await validateCSVFile(file, result);
        } catch (error) {
          result.warnings.push('Kunne ikke validere CSV-struktur');
        }
      }

    } catch (error) {
      result.errors.push(`Feil under filvalidering: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
      result.isValid = false;
    }

    return result;
  }, [config]);

  /**
   * Validate multiple files
   */
  const validateFiles = useCallback(async (files: FileList | File[]) => {
    setState(prev => ({ ...prev, isValidating: true }));

    const fileArray = Array.from(files);

    try {
      // Check max files limit
      if (config.maxFiles && fileArray.length > config.maxFiles) {
        toast.error(`Maksimum ${config.maxFiles} filer tillatt`);
        setState(prev => ({ ...prev, isValidating: false }));
        return;
      }

      // Validate each file
      const validationPromises = fileArray.map(file => validateFile(file));
      const results = await Promise.all(validationPromises);

      // Separate valid and invalid files
      const validFiles = results.filter(result => result.isValid);
      const invalidFiles = results.filter(result => !result.isValid);

      // Calculate total size
      const totalSize = validFiles.reduce((sum, result) => sum + result.file.size, 0);

      setState({
        validFiles,
        invalidFiles,
        isValidating: false,
        totalSize
      });

      // Show validation results
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} fil(er) validert`);
      }

      if (invalidFiles.length > 0) {
        toast.error(`${invalidFiles.length} fil(er) feilet validering`);
      }

    } catch (error) {
      toast.error('Feil under filvalidering');
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [config, validateFile]);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setState({
      validFiles: [],
      invalidFiles: [],
      isValidating: false,
      totalSize: 0
    });
  }, []);

  /**
   * Remove specific file
   */
  const removeFile = useCallback((fileToRemove: File) => {
    setState(prev => ({
      ...prev,
      validFiles: prev.validFiles.filter(result => result.file !== fileToRemove),
      invalidFiles: prev.invalidFiles.filter(result => result.file !== fileToRemove),
      totalSize: prev.validFiles
        .filter(result => result.file !== fileToRemove)
        .reduce((sum, result) => sum + result.file.size, 0)
    }));
  }, []);

  /**
   * Get validation errors for display
   */
  const getValidationErrors = useCallback(() => {
    return state.invalidFiles.flatMap(result => 
      result.errors.map(error => `${result.file.name}: ${error}`)
    );
  }, [state.invalidFiles]);

  /**
   * Get validation warnings for display
   */
  const getValidationWarnings = useCallback(() => {
    const allWarnings = [
      ...state.validFiles.flatMap(result => 
        result.warnings.map(warning => `${result.file.name}: ${warning}`)
      ),
      ...state.invalidFiles.flatMap(result => 
        result.warnings.map(warning => `${result.file.name}: ${warning}`)
      )
    ];
    return allWarnings;
  }, [state.validFiles, state.invalidFiles]);

  return {
    ...state,
    validateFiles,
    clearFiles,
    removeFile,
    getValidationErrors,
    getValidationWarnings,
    hasValidFiles: state.validFiles.length > 0,
    hasInvalidFiles: state.invalidFiles.length > 0,
    totalFiles: state.validFiles.length + state.invalidFiles.length
  };
};

/**
 * Utility functions
 */

/**
 * Check if file type is an image
 */
const isImage = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

/**
 * Get image dimensions
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Kunne ikke laste bilde'));
    };

    img.src = url;
  });
};

/**
 * Create image preview URL
 */
const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Kunne ikke lage forhåndsvisning'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Feil ved lesing av fil'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate CSV file structure
 */
const validateCSVFile = async (file: File, result: FileValidationResult): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          result.errors.push('CSV fil må inneholde minst header og en datarad');
          result.isValid = false;
        } else {
          const headerCount = lines[0].split(',').length;
          const invalidLines = lines.slice(1).filter(line => 
            line.split(',').length !== headerCount
          );

          if (invalidLines.length > 0) {
            result.warnings.push(`${invalidLines.length} rader har feil antall kolonner`);
          }
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Kunne ikke lese CSV fil'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel') || fileType.includes('csv')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  return '📄';
}; 
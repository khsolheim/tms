import React from 'react';
import { usePostnummer } from '../../hooks/usePostnummer';

interface PostnummerFelterProps {
  postnummer: string;
  poststed: string;
  onPostnummerChange: (postnummer: string, poststed: string) => void;
  postnummerError?: string;
  poststedError?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PostnummerFelter({
  postnummer,
  poststed,
  onPostnummerChange,
  postnummerError,
  poststedError,
  required = false,
  disabled = false,
  className = ''
}: PostnummerFelterProps) {
  const { finnPoststed } = usePostnummer();

  const handlePostnummerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Automatisk poststed-oppslag når postnummer er 4 siffer
    if (value.length === 4) {
      const funnetPoststed = finnPoststed(value);
      if (funnetPoststed) {
        onPostnummerChange(value, funnetPoststed);
      } else {
        onPostnummerChange(value, poststed);
      }
    } else {
      onPostnummerChange(value, poststed);
    }
  };

  const handlePoststedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPostnummerChange(postnummer, e.target.value);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postnummer {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={postnummer}
          onChange={handlePostnummerChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            postnummerError 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
          placeholder="1234"
          maxLength={4}
          required={required}
        />
        {postnummerError && (
          <p className="text-red-600 text-sm mt-1">{postnummerError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poststed {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={poststed}
          onChange={handlePoststedChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 ${
            poststedError 
              ? 'border-red-500' 
              : 'border-gray-300'
          } ${disabled ? 'text-gray-500' : ''}`}
          placeholder="Fylles automatisk"
          readOnly={!disabled} // Hvis disabled=false, så er poststed readonly. Hvis disabled=true, så kan begge redigeres
          required={required}
        />
        {poststedError && (
          <p className="text-red-600 text-sm mt-1">{poststedError}</p>
        )}
      </div>
    </div>
  );
} 
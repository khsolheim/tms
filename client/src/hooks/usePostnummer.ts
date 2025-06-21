import { useState, useEffect, useCallback } from 'react';

interface PostnummerData {
  postnr: string;
  poststed: string;
  kommunenr: string;
  kommune: string;
  type: string;
}

export const usePostnummer = () => {
  const [postnummerData, setPostnummerData] = useState<PostnummerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Last inn postnummer-data ved oppstart
  useEffect(() => {
    const lastPostnummerData = async () => {
      try {
        console.log('Laster postnummer-data fra /postnr.txt');
        const response = await fetch('/postnr.txt');
        if (response.ok) {
          const text = await response.text();
          const lines = text.split('\n');
          const data: PostnummerData[] = lines
            .filter(line => line.trim())
            .map(line => {
              const parts = line.split('\t');
              return {
                postnr: parts[0],
                poststed: parts[1],
                kommunenr: parts[2],
                kommune: parts[3],
                type: parts[4]
              };
            });
          console.log('Lastet postnummer-data:', data.length, 'poster');
          setPostnummerData(data);
        }
      } catch (error) {
        console.warn('Kunne ikke laste postnummer-data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    lastPostnummerData();
  }, []);

  // Funksjon for å finne poststed basert på postnummer
  const finnPoststed = useCallback((postnr: string): string => {
    if (!postnr || postnr.length !== 4) return '';
    const funnet = postnummerData.find(item => item.postnr === postnr);
    return funnet ? funnet.poststed : '';
  }, [postnummerData]);

  // Funksjon for å finne full data basert på postnummer
  const finnPostnummerData = useCallback((postnr: string): PostnummerData | null => {
    if (!postnr || postnr.length !== 4) return null;
    return postnummerData.find(item => item.postnr === postnr) || null;
  }, [postnummerData]);

  return {
    postnummerData,
    isLoading,
    finnPoststed,
    finnPostnummerData
  };
};

export type { PostnummerData }; 
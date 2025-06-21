// utils/norwegian-validators.ts
export const norwegianValidators = {
  /**
   * Validerer norsk personnummer
   * @param pnr Personnummer (11 siffer)
   * @returns boolean
   */
  personnummer: (pnr: string): boolean => {
    if (!/^\d{11}$/.test(pnr)) return false;
    
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    const digits = pnr.split('').map(Number);
    
    // Sjekk første kontrollsiffer
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += digits[i] * weights1[i];
    }
    const checkDigit1 = 11 - (sum1 % 11);
    if (checkDigit1 === 11) {
      if (digits[9] !== 0) return false;
    } else if (checkDigit1 === 10) {
      return false; // Ugyldig personnummer
    } else if (digits[9] !== checkDigit1) {
      return false;
    }
    
    // Sjekk andre kontrollsiffer
    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
      sum2 += digits[i] * weights2[i];
    }
    const checkDigit2 = 11 - (sum2 % 11);
    if (checkDigit2 === 11) {
      return digits[10] === 0;
    } else if (checkDigit2 === 10) {
      return false; // Ugyldig personnummer
    } else {
      return digits[10] === checkDigit2;
    }
  },

  /**
   * Validerer norsk organisasjonsnummer
   * @param orgnr Organisasjonsnummer (9 siffer)
   * @returns boolean
   */
  organisasjonsnummer: (orgnr: string): boolean => {
    // Fjern mellomrom og annen formatering
    const cleanOrgnr = orgnr.replace(/\s/g, '');
    
    if (!/^\d{9}$/.test(cleanOrgnr)) return false;
    
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    const digits = cleanOrgnr.split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return digits[8] === checkDigit;
  },

  /**
   * Validerer norsk kontonummer
   * @param kontonr Kontonummer (11 siffer)
   * @returns boolean
   */
  kontonummer: (kontonr: string): boolean => {
    // Fjern mellomrom, punktum og annen formatering
    const cleanKontonr = kontonr.replace(/[\s.]/g, '');
    
    if (!/^\d{11}$/.test(cleanKontonr)) return false;
    
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const digits = cleanKontonr.split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    
    return digits[10] === checkDigit;
  },

  /**
   * Validerer norsk postnummer
   * @param postnr Postnummer (4 siffer)
   * @returns boolean
   */
  postnummer: (postnr: string): boolean => {
    return /^\d{4}$/.test(postnr);
  },

  /**
   * Validerer norsk telefonnummer
   * @param tlf Telefonnummer (ulike formater)
   * @returns boolean
   */
  telefonnummer: (tlf: string): boolean => {
    // Fjern mellomrom, bindestrek og paranteser
    const cleanTlf = tlf.replace(/[\s\-+()]/g, '');
    
    // Norske telefonnummer er 8 siffer, eller 11 siffer med landkode (+47)
    if (cleanTlf.length === 8) {
      return /^[2-9]\d{7}$/.test(cleanTlf);
    } else if (cleanTlf.length === 10 && cleanTlf.startsWith('47')) {
      return /^47[2-9]\d{7}$/.test(cleanTlf);
    } else if (cleanTlf.length === 11 && cleanTlf.startsWith('0047')) {
      return /^0047[2-9]\d{7}$/.test(cleanTlf);
    }
    
    return false;
  },

  /**
   * Validerer norsk KID-nummer (kunde-identifikasjonsnummer)
   * @param kid KID-nummer
   * @returns boolean
   */
  kidNummer: (kid: string): boolean => {
    // Fjern mellomrom
    const cleanKid = kid.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cleanKid) || cleanKid.length < 2 || cleanKid.length > 25) {
      return false;
    }

    // MOD10 kontrollsiffer validering
    const digits = cleanKid.split('').map(Number);
    let sum = 0;
    let multiply = 2;

    // Start fra høyre, hopp over siste siffer (kontrollsiffer)
    for (let i = digits.length - 2; i >= 0; i--) {
      let product = digits[i] * multiply;
      if (product > 9) {
        product = Math.floor(product / 10) + (product % 10);
      }
      sum += product;
      multiply = multiply === 2 ? 1 : 2;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[digits.length - 1];
  },

  /**
   * Formaterer personnummer for visning (maskert)
   * @param pnr Personnummer
   * @returns Maskert personnummer
   */
  formatPersonnummerMasked: (pnr: string): string => {
    if (pnr.length === 11) {
      return `${pnr.substring(0, 6)}*****`;
    }
    return pnr;
  },

  /**
   * Formaterer organisasjonsnummer for visning
   * @param orgnr Organisasjonsnummer
   * @returns Formatert organisasjonsnummer
   */
  formatOrganisasjonsnummer: (orgnr: string): string => {
    if (orgnr.length === 9) {
      return `${orgnr.substring(0, 3)} ${orgnr.substring(3, 6)} ${orgnr.substring(6)}`;
    }
    return orgnr;
  },

  /**
   * Formaterer kontonummer for visning
   * @param kontonr Kontonummer
   * @returns Formatert kontonummer
   */
  formatKontonummer: (kontonr: string): string => {
    if (kontonr.length === 11) {
      return `${kontonr.substring(0, 4)}.${kontonr.substring(4, 6)}.${kontonr.substring(6)}`;
    }
    return kontonr;
  },

  /**
   * Formaterer telefonnummer for visning
   * @param tlf Telefonnummer
   * @returns Formatert telefonnummer
   */
  formatTelefonnummer: (tlf: string): string => {
    // Fjern alt som ikke er siffer eller +
    const cleanTlf = tlf.replace(/[^\d+]/g, '');
    
    if (cleanTlf.length === 8) {
      return cleanTlf.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
    } else if (cleanTlf.length === 10 && cleanTlf.startsWith('47')) {
      const number = cleanTlf.slice(2);
      return `+47 ${number.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3')}`;
    }
    
    return tlf; // Return original if no valid format found
  },

  /**
   * Henter alder fra personnummer
   * @param pnr Personnummer
   * @returns Alder i år
   */
  getAgeFromPersonnummer: (pnr: string): number | null => {
    if (!norwegianValidators.personnummer(pnr)) return null;
    
    const day = parseInt(pnr.substring(0, 2));
    const month = parseInt(pnr.substring(2, 4));
    let year = parseInt(pnr.substring(4, 6));
    
    // Håndter århundre basert på individnummer
    const individNummer = parseInt(pnr.substring(6, 9));
    if (individNummer >= 0 && individNummer <= 499) {
      year += 1900;
    } else if (individNummer >= 500 && individNummer <= 999) {
      year += 2000;
    }
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Sjekker om person er myndig (18 år eller eldre)
   * @param pnr Personnummer
   * @returns boolean
   */
  isAdult: (pnr: string): boolean => {
    const age = norwegianValidators.getAgeFromPersonnummer(pnr);
    return age !== null && age >= 18;
  },

  /**
   * Henter kjønn fra personnummer
   * @param pnr Personnummer
   * @returns 'M' for mann, 'K' for kvinne, null hvis ugyldig
   */
  getGenderFromPersonnummer: (pnr: string): 'M' | 'K' | null => {
    if (!norwegianValidators.personnummer(pnr)) return null;
    
    const genderDigit = parseInt(pnr.substring(8, 9));
    return genderDigit % 2 === 0 ? 'K' : 'M';
  }
}; 
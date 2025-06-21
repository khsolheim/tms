export type Rolle = 'ADMIN' | 'HOVEDBRUKER' | 'TRAFIKKLARER' | 'ELEV';

export interface Tilgang {
  id: string;
  navn: string;
  beskrivelse: string;
  kategori: 'administrasjon' | 'bedrift' | 'opplæring' | 'system';
}

export const TILGANGER: Tilgang[] = [
  // Administrasjon
  {
    id: 'admin_full',
    navn: 'Full administratortilgang',
    beskrivelse: 'Full tilgang til alle systemets funksjoner',
    kategori: 'administrasjon'
  },
  {
    id: 'bedrift_admin',
    navn: 'Bedriftsadministrasjon',
    beskrivelse: 'Administrere bedriftsinformasjon og innstillinger',
    kategori: 'administrasjon'
  },
  
  // Bedrift
  {
    id: 'ansatt_admin',
    navn: 'Ansatthåndtering',
    beskrivelse: 'Legge til og administrere ansatte',
    kategori: 'bedrift'
  },
  {
    id: 'elev_admin',
    navn: 'Elevhåndtering',
    beskrivelse: 'Administrere elever og deres progresjon',
    kategori: 'bedrift'
  },
  
  // Opplæring
  {
    id: 'godkjenn_kontroll',
    navn: 'Godkjenne kontroller',
    beskrivelse: 'Godkjenne elevers sikkerhetskontroller',
    kategori: 'opplæring'
  },
  {
    id: 'opprett_quiz',
    navn: 'Opprette quiz',
    beskrivelse: 'Lage og administrere quizer',
    kategori: 'opplæring'
  },
  
  // System
  {
    id: 'ta_quiz',
    navn: 'Ta quiz',
    beskrivelse: 'Tilgang til å ta quiz',
    kategori: 'system'
  },
  {
    id: 'registrer_kontroll',
    navn: 'Registrere kontroll',
    beskrivelse: 'Registrere sikkerhetskontroller',
    kategori: 'system'
  }
];

export const STANDARD_ROLLETILGANGER: Record<Rolle, string[]> = {
  ADMIN: TILGANGER.map(t => t.id),
  HOVEDBRUKER: [
    'bedrift_admin',
    'ansatt_admin',
    'elev_admin',
    'opprett_quiz',
    'godkjenn_kontroll'
  ],
  TRAFIKKLARER: [
    'elev_admin',
    'godkjenn_kontroll',
    'opprett_quiz'
  ],
  ELEV: [
    'ta_quiz',
    'registrer_kontroll'
  ]
}; 
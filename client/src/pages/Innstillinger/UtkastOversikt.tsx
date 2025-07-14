import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiSearch,
  FiSidebar,
  FiLayers,
  FiInfo,
  FiArrowRight,
  FiStar,
  FiEye,
  FiCode
} from 'react-icons/fi';

interface UtkastInfo {
  id: string;
  navn: string;
  beskrivelse: string;
  fokus: string;
  fordeler: string[];
  egnetFor: string;
  ikon: React.ComponentType<any>;
  farge: string;
  component: string;
}

const utkast: UtkastInfo[] = [
  {
    id: 'kategorisert',
    navn: 'Kategorisert Layout med Faner',
    beskrivelse: 'Organiserer innstillinger i logiske grupper med faner for enkel navigering mellom kategorier.',
    fokus: 'Organisering og kategorisering',
    fordeler: [
      'Tydelig kategorisering reduserer kognitiv belastning',
      'Hurtig bytte mellom relaterte innstillingsgrupper',
      'Kjent navigasjonsmønster fra andre applikasjoner',
      'Skalerer godt med mange innstillinger'
    ],
    egnetFor: 'Brukere som ønsker strukturert tilgang til spesifikke kategorier',
    ikon: FiGrid,
    farge: 'blue',
    component: 'Utkast1_KategorisertLayout'
  },
  {
    id: 'sok-filter',
    navn: 'Søk og Filter-basert',
    beskrivelse: 'Kraftig søke- og filterfunksjonalitet med hurtigtilgang til mest brukte innstillinger.',
    fokus: 'Søkbarhet og effektivitet',
    fordeler: [
      'Rask søk i alle innstillinger samtidig',
      'Avanserte filtre for rollbasert visning',
      'Hurtigtilgang til viktige innstillinger',
      'Perfekt for erfarne brukere'
    ],
    egnetFor: 'Power-users som vet hva de leter etter',
    ikon: FiSearch,
    farge: 'green',
    component: 'Utkast2_SokOgFilter'
  },
  {
    id: 'sidebar',
    navn: 'Sidebar Navigasjon',
    beskrivelse: 'Permanent sidebar-meny med kategorier og underkategorier for konsistent navigasjon.',
    fokus: 'Permanent tilgjengelighet',
    fordeler: [
      'Alltid synlig navigasjonsstruktur',
      'Hierarkisk visning av kategorier',
      'Hurtiglenker til underkategorier',
      'Kan skjules for mer plass'
    ],
    egnetFor: 'Brukere som trenger konstant tilgang til navigasjon',
    ikon: FiSidebar,
    farge: 'purple',
    component: 'Utkast3_SidebarNavigasjon'
  },
  {
    id: 'kort-beskrivelse',
    navn: 'Utvidede Kort med Beskrivelser',
    beskrivelse: 'Større kort med mer informasjon, statistikk og valg mellom grid- og listevisning.',
    fokus: 'Informasjonsrikdom',
    fordeler: [
      'Mer informasjon synlig uten å klikke',
      'Statistikk gir systemoversikt',
      'Fleksibel visning (grid/liste)',
      'Visuelt attraktivt design'
    ],
    egnetFor: 'Brukere som vil ha full oversikt før de navigerer',
    ikon: FiInfo,
    farge: 'orange',
    component: 'Utkast4_KortBeskrivelse'
  },
  {
    id: 'hierarkisk',
    navn: 'Hierarkisk Meny-struktur',
    beskrivelse: 'Trestruktur med utvidbare kategorier som viser parent-child forhold tydelig.',
    fokus: 'Hierarkisk forståelse',
    fordeler: [
      'Tydelig hierarkisk struktur',
      'Utvidbare seksjoner for kontroll',
      'Visuell representasjon av forhold',
      'God for komplekse systemer'
    ],
    egnetFor: 'Systemer med dype hierarkier og komplekse relasjoner',
    ikon: FiLayers,
    farge: 'red',
    component: 'Utkast5_HierarkiskMeny'
  }
];

const fargeMap = {
  blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  red: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
};

export default function UtkastOversikt() {
  const navigate = useNavigate();

  const handleViewUtkast = (component: string) => {
    // For testing purposes, navigate to a route that would show the component
    navigate(`/innstillinger/utkast/${component}`);
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FiEye className="w-8 h-8 mr-3 text-blue-600" />
          5 UI-Utkast for Innstillinger
        </h1>
        <p className="text-gray-600 text-lg">
          Sammenligning av forskjellige tilnærminger for å gjøre Innstillinger-siden mer oversiktlig og lettere å navigere
        </p>
      </div>

      {/* Sammendrag */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
        <div className="flex items-start space-x-3">
          <FiStar className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Designfilosofi og Tilnærming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800 text-sm">
              <div>
                <h3 className="font-medium mb-2">🎯 Hovedmål</h3>
                <ul className="space-y-1">
                  <li>• Redusere kognitiv belastning ved navigering</li>
                  <li>• Forbedre findbarhet av spesifikke innstillinger</li>
                  <li>• Tilpasse grensesnittet til ulike brukertyper</li>
                  <li>• Bevare eksisterende funksjonalitet</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">🔧 Designprinsipper</h3>
                <ul className="space-y-1">
                  <li>• Konsistent visuell hierarki</li>
                  <li>• Rollbasert tilgangskontroll</li>
                  <li>• Responsivt design for alle enheter</li>
                  <li>• Progressive disclosure av informasjon</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utkast Cards */}
      <div className="grid grid-cols-1 gap-8">
        {utkast.map((item, index) => {
          const farge = fargeMap[item.farge as keyof typeof fargeMap];
          
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className={`${farge.bg} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <item.ikon className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Utkast {index + 1}: {item.navn}</h2>
                      <p className="text-white/80 text-sm mt-1">Fokus: {item.fokus}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewUtkast(item.component)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>Se Utkast</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Beskrivelse */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Beskrivelse</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {item.beskrivelse}
                    </p>
                    
                    <h3 className="font-semibold text-gray-900 mb-3">Hovedfordeler</h3>
                    <ul className="space-y-2">
                      {item.fordeler.map((fordel, i) => (
                        <li key={i} className="flex items-start space-x-2 text-gray-600 text-sm">
                          <span className={`w-1.5 h-1.5 rounded-full ${farge.bg} mt-2 flex-shrink-0`}></span>
                          <span>{fordel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    <div className={`${farge.light} ${farge.border} border rounded-lg p-4`}>
                      <h4 className="font-medium text-gray-900 mb-2">Egnet for</h4>
                      <p className={`${farge.text} text-sm`}>
                        {item.egnetFor}
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Teknisk info</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiCode className="w-4 h-4" />
                        <span>{item.component}.tsx</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewUtkast(item.component)}
                      className={`w-full ${farge.bg} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                    >
                      <span>Test dette utkastet</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Implementeringsnotater */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start space-x-3">
          <FiCode className="w-6 h-6 text-gray-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Implementeringsnotater
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tekniske detaljer</h4>
                <ul className="space-y-1">
                  <li>• Alle utkast bruker samme datastruktur (innstillingerService)</li>
                  <li>• Rollbasert tilgangskontroll er implementert i alle varianter</li>
                  <li>• Responsivt design med Tailwind CSS</li>
                  <li>• TypeScript for type-sikkerhet</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Neste steg</h4>
                <ul className="space-y-1">
                  <li>• Test hver variant med faktiske brukere</li>
                  <li>• Samle feedback på navigasjonseffektivitet</li>
                  <li>• Velg favorittutkast for videre utvikling</li>
                  <li>• Implementer ytterligere optimaliseringer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  PhotoIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import {
  PlusIcon as PlusIconSolid,
  CheckIcon as CheckIconSolid
} from '@heroicons/react/24/solid';

interface SporsmalElement {
  id: string;
  type: 'tekst' | 'multiple_choice' | 'ja_nei' | 'skala' | 'bilde' | 'lyd' | 'video' | 'fritekst';
  innhold: any;
  rekkefølge: number;
  obligatorisk: boolean;
  poeng: number;
  tidsgrense?: number;
}

interface TestBuilder {
  id: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  vanskelighetsgrad: 'lett' | 'medium' | 'vanskelig';
  estimertTid: number;
  elementer: SporsmalElement[];
  status: 'kladd' | 'publisert' | 'arkivert';
  opprettet: string;
  sistEndret: string;
}

const AdminForslag2Builder: React.FC = () => {
  const [activeTest, setActiveTest] = useState<TestBuilder | null>(null);
  const [availableElements, setAvailableElements] = useState<any[]>([]);
  const [draggedElement, setDraggedElement] = useState<any>(null);
  const [showElementModal, setShowElementModal] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Mock test data
    setActiveTest({
      id: '1',
      navn: 'Bil Sikkerhetskontroll - Grunnleggende',
      beskrivelse: 'Grunnleggende test for personbil sikkerhetskontroll',
      kategori: 'Bil',
      vanskelighetsgrad: 'medium',
      estimertTid: 15,
      status: 'kladd',
      opprettet: '2024-01-15',
      sistEndret: '2024-01-15 14:30',
      elementer: [
        {
          id: 'e1',
          type: 'tekst',
          innhold: {
            tittel: 'Velkommen til sikkerhetskontroll',
            tekst: 'Dette er en grunnleggende test for å sjekke din kunnskap om bilsikkerhet.'
          },
          rekkefølge: 1,
          obligatorisk: true,
          poeng: 0
        },
        {
          id: 'e2',
          type: 'multiple_choice',
          innhold: {
            spørsmål: 'Hva er minimumskravet for dekkmønster på sommerdekk?',
            alternativer: [
              { id: 'a1', tekst: '1.6 mm', korrekt: true },
              { id: 'a2', tekst: '3.0 mm', korrekt: false },
              { id: 'a3', tekst: '2.5 mm', korrekt: false },
              { id: 'a4', tekst: '4.0 mm', korrekt: false }
            ],
            forklaring: 'Lovkravet for sommerdekk er minimum 1.6 mm mønsterdybde.'
          },
          rekkefølge: 2,
          obligatorisk: true,
          poeng: 10,
          tidsgrense: 30
        },
        {
          id: 'e3',
          type: 'bilde',
          innhold: {
            spørsmål: 'Ta et bilde av dekket og marker eventuelle skader',
            instruksjoner: 'Bruk kameraet til å ta et tydelig bilde av dekket',
            maksFilstørrelse: '5MB'
          },
          rekkefølge: 3,
          obligatorisk: true,
          poeng: 15
        }
      ]
    });

    // Available element types
    setAvailableElements([
      {
        type: 'tekst',
        navn: 'Tekst/Instruksjon',
        ikon: DocumentTextIcon,
        beskrivelse: 'Legg til informasjonstekst eller instruksjoner',
        farge: 'blue'
      },
      {
        type: 'multiple_choice',
        navn: 'Flervalg',
        ikon: ClipboardDocumentCheckIcon,
        beskrivelse: 'Spørsmål med flere svaralternativer',
        farge: 'green'
      },
      {
        type: 'ja_nei',
        navn: 'Ja/Nei',
        ikon: CheckIcon,
        beskrivelse: 'Enkelt ja/nei spørsmål',
        farge: 'purple'
      },
      {
        type: 'skala',
        navn: 'Skala',
        ikon: ChartBarIcon,
        beskrivelse: 'Vurdering på en skala (1-5, 1-10)',
        farge: 'orange'
      },
      {
        type: 'bilde',
        navn: 'Bilde',
        ikon: PhotoIcon,
        beskrivelse: 'Last opp eller ta bilde',
        farge: 'pink'
      },
      {
        type: 'lyd',
        navn: 'Lyd',
        ikon: MicrophoneIcon,
        beskrivelse: 'Ta opp eller last opp lyd',
        farge: 'red'
      },
      {
        type: 'video',
        navn: 'Video',
        ikon: VideoCameraIcon,
        beskrivelse: 'Ta opp eller last opp video',
        farge: 'indigo'
      },
      {
        type: 'fritekst',
        navn: 'Fritekst',
        ikon: PencilSquareIcon,
        beskrivelse: 'Åpent tekstfelt for svar',
        farge: 'gray'
      }
    ]);
  }, []);

  const getElementTypeInfo = (type: string) => {
    return availableElements.find(el => el.type === type);
  };

  const getColorClasses = (farge: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[farge as keyof typeof colors] || colors.gray;
  };

  const handleDragStart = (e: React.DragEvent, element: any) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    if (draggedElement && activeTest) {
      const newElement: SporsmalElement = {
        id: `e${Date.now()}`,
        type: draggedElement.type,
        innhold: getDefaultContent(draggedElement.type),
        rekkefølge: targetIndex !== undefined ? targetIndex : activeTest.elementer.length + 1,
        obligatorisk: true,
        poeng: draggedElement.type === 'tekst' ? 0 : 10
      };

      const updatedElements = [...activeTest.elementer];
      if (targetIndex !== undefined) {
        updatedElements.splice(targetIndex, 0, newElement);
        // Oppdater rekkefølge for alle elementer
        updatedElements.forEach((el, index) => {
          el.rekkefølge = index + 1;
        });
      } else {
        updatedElements.push(newElement);
      }

      setActiveTest({
        ...activeTest,
        elementer: updatedElements,
        sistEndret: new Date().toLocaleString()
      });
    }
    setDraggedElement(null);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'tekst':
        return {
          tittel: 'Ny instruksjon',
          tekst: 'Skriv din instruksjon her...'
        };
      case 'multiple_choice':
        return {
          spørsmål: 'Nytt flervalg spørsmål?',
          alternativer: [
            { id: 'a1', tekst: 'Alternativ 1', korrekt: true },
            { id: 'a2', tekst: 'Alternativ 2', korrekt: false }
          ],
          forklaring: ''
        };
      case 'ja_nei':
        return {
          spørsmål: 'Nytt ja/nei spørsmål?',
          korrektSvar: true,
          forklaring: ''
        };
      case 'bilde':
        return {
          spørsmål: 'Ta et bilde av...',
          instruksjoner: 'Instruksjoner for bildeopplasting',
          maksFilstørrelse: '5MB'
        };
      default:
        return {};
    }
  };

  const moveElement = (fromIndex: number, toIndex: number) => {
    if (!activeTest) return;
    
    const updatedElements = [...activeTest.elementer];
    const [movedElement] = updatedElements.splice(fromIndex, 1);
    updatedElements.splice(toIndex, 0, movedElement);
    
    // Oppdater rekkefølge
    updatedElements.forEach((el, index) => {
      el.rekkefølge = index + 1;
    });

    setActiveTest({
      ...activeTest,
      elementer: updatedElements,
      sistEndret: new Date().toLocaleString()
    });
  };

  const deleteElement = (elementId: string) => {
    if (!activeTest) return;
    
    const updatedElements = activeTest.elementer.filter(el => el.id !== elementId);
    updatedElements.forEach((el, index) => {
      el.rekkefølge = index + 1;
    });

    setActiveTest({
      ...activeTest,
      elementer: updatedElements,
      sistEndret: new Date().toLocaleString()
    });
  };

  const renderElement = (element: SporsmalElement, index: number) => {
    const typeInfo = getElementTypeInfo(element.type);
    if (!typeInfo) return null;

    const IconComponent = typeInfo.ikon;

    return (
      <div
        key={element.id}
        className={`bg-white rounded-lg border-2 p-4 mb-3 ${getColorClasses(typeInfo.farge)} hover:shadow-md transition-shadow`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 bg-${typeInfo.farge}-200`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium">{typeInfo.navn}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>#{element.rekkefølge}</span>
                {element.poeng > 0 && (
                  <>
                    <span>•</span>
                    <span>{element.poeng} poeng</span>
                  </>
                )}
                {element.tidsgrense && (
                  <>
                    <span>•</span>
                    <ClockIcon className="w-4 h-4 inline" />
                    <span>{element.tidsgrense}s</span>
                  </>
                )}
                {element.obligatorisk && (
                  <>
                    <span>•</span>
                    <span className="text-red-600">Obligatorisk</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => moveElement(index, Math.max(0, index - 1))}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>
            <button className="p-1 text-blue-600 hover:text-blue-800">
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-600 hover:text-gray-800">
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteElement(element.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Element content preview */}
        <div className="text-sm text-gray-700">
          {element.type === 'tekst' && (
            <div>
              <p className="font-medium">{element.innhold.tittel}</p>
              <p className="text-gray-600">{element.innhold.tekst}</p>
            </div>
          )}
          {element.type === 'multiple_choice' && (
            <div>
              <p className="font-medium mb-2">{element.innhold.spørsmål}</p>
              <div className="space-y-1">
                {element.innhold.alternativer?.map((alt: any, i: number) => (
                  <div key={alt.id} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${alt.korrekt ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>{alt.tekst}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {element.type === 'bilde' && (
            <div>
              <p className="font-medium">{element.innhold.spørsmål}</p>
              <p className="text-gray-600 text-xs">{element.innhold.instruksjoner}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!activeTest) {
    return <div>Laster...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/sikkerhetskontroll"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Tilbake til forslag
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Builder</h1>
                <p className="text-gray-600 mt-1">Drag-and-drop builder for tester og spørsmål</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                {previewMode ? 'Rediger' : 'Forhåndsvis'}
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <CheckIconSolid className="w-4 h-4 mr-2" />
                Publiser Test
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Element Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Element Bibliotek</h3>
              <div className="space-y-3">
                {availableElements.map((element) => {
                  const IconComponent = element.ikon;
                  return (
                    <div
                      key={element.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element)}
                      className={`p-3 rounded-lg border-2 border-dashed cursor-move hover:shadow-md transition-shadow ${getColorClasses(element.farge)}`}
                    >
                      <div className="flex items-center mb-2">
                        <IconComponent className="w-5 h-5 mr-2" />
                        <span className="font-medium text-sm">{element.navn}</span>
                      </div>
                      <p className="text-xs text-gray-600">{element.beskrivelse}</p>
                    </div>
                  );
                })}
              </div>

              {/* Test Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Test Informasjon</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Navn:</span>
                    <p className="font-medium">{activeTest.navn}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Elementer:</span>
                    <p className="font-medium">{activeTest.elementer.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total poeng:</span>
                    <p className="font-medium">
                      {activeTest.elementer.reduce((sum, el) => sum + el.poeng, 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimert tid:</span>
                    <p className="font-medium">{activeTest.estimertTid} min</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      activeTest.status === 'publisert' ? 'bg-green-100 text-green-800' :
                      activeTest.status === 'kladd' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeTest.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Builder Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Test Builder</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Sist endret: {activeTest.sistEndret}
                </div>
              </div>

              {/* Drop Zone */}
              <div
                className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-6"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e)}
              >
                {activeTest.elementer.length === 0 ? (
                  <div className="text-center py-12">
                    <Squares2X2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Start bygge din test</h4>
                    <p className="text-gray-600 mb-4">
                      Dra elementer fra biblioteket til høyre for å bygge din test
                    </p>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <ArrowRightIcon className="w-4 h-4 mr-2" />
                      Dra og slipp elementer her
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTest.elementer
                      .sort((a, b) => a.rekkefølge - b.rekkefølge)
                      .map((element, index) => renderElement(element, index))}
                    
                    {/* Add element drop zone */}
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e)}
                    >
                      <PlusIconSolid className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Dra et nytt element hit</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForslag2Builder; 
import React, { useState } from 'react';
// import { useTranslation } from '../../contexts/I18nContext'; // Unused for now
// import { useAccessibility } from '../../contexts/AccessibilityContext'; // Unused for now
import Breadcrumbs from '../ui/Breadcrumbs';
import { 
  Tooltip, 
  HelpIcon, 
  FieldHelp, 
  ContextHelp, 
  GuidedTour 
} from '../ui/Tooltip';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useTextUndoRedo, useFormUndoRedo } from '../../hooks/useUndoRedo';
import { 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  InformationCircleIcon,
  KeyIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

const UXDemo: React.FC = () => {
  // const { t: _ } = useTranslation(); // Currently unused
  // const { settings: __ } = useAccessibility(); // Currently unused
  const [textValue, setTextValue] = useState('Skriv her for å teste undo/redo...');
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // Demo form data
  const [formData] = useState({
    name: '',
    email: '',
    orgNumber: '',
    items: ['Item 1', 'Item 2']
  });

  // Undo/Redo for text
  const textUndoRedo = useTextUndoRedo(textValue, setTextValue, {
    enableKeyboardShortcuts: true,
    maxStackSize: 20
  });

  // Undo/Redo for form
  const formUndoRedo = useFormUndoRedo(formData, {
    enableKeyboardShortcuts: true
  });

  // Keyboard navigation for demo buttons
  const keyboardNav = useKeyboardNavigation({
    direction: 'horizontal',
    loop: true,
    selector: '[data-keyboard-nav]'
  });

  // Custom breadcrumb examples
  const customBreadcrumbs = [
    { label: 'Hjem', href: '/oversikt', icon: InformationCircleIcon },
    { label: 'Bedrifter', href: '/bedrifter' },
    { label: 'Eksempel Bedrift AS', href: '/bedrifter/123' },
    { label: 'Rediger', isCurrentPage: true }
  ];

  // Wizard steps example
  const wizardSteps = [
    { label: 'Grunninfo', completed: true },
    { label: 'Kontakt', completed: true },
    { label: 'Verifisering', completed: false },
    { label: 'Bekreftelse', completed: false }
  ];

  // Guided tour steps
  const tourSteps = [
    {
      target: '[data-tour="breadcrumbs"]',
      title: 'Navigasjonssti',
      content: 'Breadcrumbs viser hvor du er i systemet og lar deg navigere tilbake til tidligere sider.'
    },
    {
      target: '[data-tour="tooltips"]',
      title: 'Hjelpetips',
      content: 'Hold musepekeren over hjelpeikonene for å få kontekstuell hjelp og forklaringer.'
    },
    {
      target: '[data-tour="keyboard"]',
      title: 'Tastaturnavigasjon',
      content: 'Bruk piltastene for å navigere mellom elementer, Tab for å hoppe mellom seksjoner.'
    },
    {
      target: '[data-tour="undo"]',
      title: 'Angre/Gjør om',
      content: 'Bruk Ctrl+Z for å angre og Ctrl+Y for å gjøre om handlinger. Fungerer på tekst og skjemaer.'
    }
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    textUndoRedo.setValue(e.target.value, 'Tekst endring');
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    formUndoRedo.updateField(field, value, `Oppdater ${field}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 py-1 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          UX-Forbedringer Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Demonstrasjon av avanserte brukeropplevelse-funksjoner
        </p>
        
        <button
          onClick={() => setShowTour(true)}
          className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <CursorArrowRaysIcon className="h-5 w-5 mr-2" />
          Start Guidet Omvisning
        </button>
      </div>

      {/* Breadcrumbs Demo */}
      <section className="cards-spacing-vertical" data-tour="breadcrumbs">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            1. Navigasjonssti (Breadcrumbs)
          </h2>
          <HelpIcon helpKey="breadcrumbs" size="md" />
        </div>
        
        <div className="grid cards-spacing-grid">
          <div className="bg-gray-50 px-2 py-1 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Automatisk generert</h3>
            <Breadcrumbs />
          </div>
          
          <div className="bg-gray-50 px-2 py-1 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Tilpasset breadcrumbs</h3>
            <Breadcrumbs />
          </div>
        </div>
      </section>

      {/* Tooltips & Help Demo */}
      <section className="cards-spacing-vertical" data-tour="tooltips">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Hjelpetips og Kontekstuell Hjelp
          </h2>
          <HelpIcon helpKey="tooltips" size="md" />
        </div>
        
        <div className="grid md:grid-cols-2 cards-spacing-grid">
          <div className="bg-gray-50 px-2 py-1 rounded-lg cards-spacing-vertical">
            <h3 className="font-medium text-gray-900">Grunnleggende tooltips</h3>
            
            <div className="flex items-center cards-spacing-grid">
              <Tooltip content="Dette er en enkel tooltip" placement="top">
                <button onClick={() => console.log('Button clicked')} className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  Hover meg (topp)
                </button>
              </Tooltip>
              
              <Tooltip content="Klikk for å vise/skjule" trigger="click" placement="bottom">
                <button onClick={() => console.log('Button clicked')} className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                  Klikk meg (bunn)
                </button>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Felt med hjelp</span>
              <HelpIcon helpKey="organisasjonsnummer" size="sm" />
            </div>
          </div>
          
          <div className="bg-gray-50 px-2 py-1 rounded-lg cards-spacing-vertical">
            <h3 className="font-medium text-gray-900">Skjemafelt med hjelp</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organisasjonsnummer
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
              />
              <FieldHelp helpKey="organisasjonsnummer" />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                E-post
                <FieldHelp helpKey="epost" inline />
              </label>
              <input
                type="email"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="post@bedrift.no"
              />
            </div>
          </div>
        </div>
        
        <ContextHelp helpKey="bedriftRegistrering" />
      </section>

      {/* Keyboard Navigation Demo */}
      <section className="cards-spacing-vertical" data-tour="keyboard">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Tastaturnavigasjon
          </h2>
          <HelpIcon helpKey="keyboard" size="md" />
        </div>
        
        <div className="bg-gray-50 px-2 py-1 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Bruk piltastene for å navigere mellom knappene nedenfor:
          </p>
          
          <div ref={keyboardNav.containerRef} className="flex cards-spacing-grid flex-wrap">
            {['Første', 'Andre', 'Tredje', 'Fjerde', 'Femte'].map((label, index) => (
              <button onClick={() => console.log('Button clicked')}
                key={index}
                data-keyboard-nav
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-300"
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2 mb-1">
              <KeyIcon className="h-4 w-4" />
              <span>←→ Navigér horisontalt</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <KeyIcon className="h-4 w-4" />
              <span>↑↓ Navigér vertikalt</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyIcon className="h-4 w-4" />
              <span>Enter/Space Aktiver element</span>
            </div>
          </div>
        </div>
      </section>

      {/* Undo/Redo Demo */}
      <section className="cards-spacing-vertical" data-tour="undo">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Angre/Gjør om (Undo/Redo)
          </h2>
          <HelpIcon helpKey="undoRedo" size="md" />
        </div>
        
        <div className="grid md:grid-cols-2 cards-spacing-grid">
          <div className="bg-gray-50 px-2 py-1 rounded-lg cards-spacing-vertical">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Tekst Undo/Redo</h3>
              <div className="flex gap-4">
                <Tooltip content={textUndoRedo.canUndo ? `Angre: ${textUndoRedo.nextUndoAction?.description}` : 'Ingenting å angre'}>
                  <button
                    onClick={() => textUndoRedo.undo()}
                    disabled={!textUndoRedo.canUndo}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
                <Tooltip content={textUndoRedo.canRedo ? `Gjør om: ${textUndoRedo.nextRedoAction?.description}` : 'Ingenting å gjøre om'}>
                  <button
                    onClick={() => textUndoRedo.redo()}
                    disabled={!textUndoRedo.canRedo}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUturnRightIcon className="h-5 w-5" />
                  </button>
                </Tooltip>
              </div>
            </div>
            
            <textarea
              value={textValue}
              onChange={handleTextChange}
              className="w-full h-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Skriv noe her..."
            />
            
            <div className="text-xs text-gray-500">
              <p>Handlinger: {textUndoRedo.undoStack.length}</p>
              <p className="mt-1">Ctrl+Z = Angre | Ctrl+Y = Gjør om</p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-2 py-1 rounded-lg cards-spacing-vertical">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Skjema Undo/Redo</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => formUndoRedo.undo()}
                  disabled={!formUndoRedo.canUndo}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => formUndoRedo.redo()}
                  disabled={!formUndoRedo.canRedo}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUturnRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedriftsnavn
                </label>
                <input
                  type="text"
                  value={formUndoRedo.formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Org.nummer
                </label>
                <input
                  type="text"
                  value={formUndoRedo.formData.orgNumber}
                  onChange={(e) => handleFormChange('orgNumber', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-post
                </label>
                <input
                  type="email"
                  value={formUndoRedo.formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Handlinger: {formUndoRedo.undoStack.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
        <div className="flex items-start cards-spacing-grid">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              UX-Forbedringer Implementert
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Breadcrumbs for bedre navigasjon med automatisk generering</li>
              <li>✅ Omfattende tooltip og hjelpesystem med kontekstuell informasjon</li>
              <li>✅ Avansert tastaturnavigasjon med ARIA-støtte</li>
              <li>✅ Undo/Redo-funksjonalitet for tekst og skjemaer</li>
              <li>✅ Guidede omvisninger og progressive hjelpsystemer</li>
              <li>✅ Tilgjengelighet (a11y) innebygd i alle komponenter</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Guided Tour */}
      <GuidedTour
        steps={tourSteps}
        isActive={showTour}
        currentStep={tourStep}
        onStepChange={setTourStep}
        onComplete={() => setShowTour(false)}
        onSkip={() => setShowTour(false)}
      />
    </div>
  );
}

export default UXDemo; 
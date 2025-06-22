import React from 'react';
import { Link } from 'react-router-dom';
import {
  ViewColumnsIcon,
  ListBulletIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const forslagData = [
  {
    id: 1,
    title: 'Kanban Board',
    description: 'Visuell prosjektstyring med drag-and-drop funksjonalitet. Oppgaver organiseres i kolonner basert på status.',
    icon: ViewColumnsIcon,
    features: ['Drag-and-drop', 'Visuell progresjon', 'Fargekoding etter prioritet', 'Kompakte kort'],
    bestFor: 'Teams som jobber med mange oppgaver samtidig',
    path: '/oppgaver/forslag1',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 2,
    title: 'Liste med filtrering',
    description: 'Tradisjonell tabell-visning med kraftige filtrerings- og sorteringsverktøy. Alle oppgave-detaljer synlige.',
    icon: ListBulletIcon,
    features: ['Avansert filtrering', 'Sortering på alle kolonner', 'Bulk-handlinger', 'Eksport-funksjoner'],
    bestFor: 'Brukere som trenger å se mye informasjon på én gang',
    path: '/oppgaver/forslag2',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 3,
    title: 'Kalender & Tidslinje',
    description: 'Dato-fokusert visning med måneds-, uke- og tidslinjevisning. Perfekt for deadline-planlegging.',
    icon: CalendarIcon,
    features: ['3 visningsmoduser', 'Forfallsdato-fokus', 'Forsinket-varsling', 'Navigasjon mellom perioder'],
    bestFor: 'Brukere som planlegger arbeid basert på deadlines',
    path: '/oppgaver/forslag3',
    color: 'bg-purple-50 border-purple-200'
  }
];

export default function OppgaverIndex() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oppgaver - Design Forslag</h1>
        <p className="text-lg text-gray-600">
          Velg mellom 3 forskjellige tilnærminger til oppgavehåndtering. Hver har sine styrker og er tilpasset ulike arbeidsflyter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {forslagData.map((forslag) => {
          const Icon = forslag.icon;
          return (
            <div key={forslag.id} className={`${forslag.color} rounded-xl border-2 p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Icon className="h-8 w-8 text-gray-700" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{forslag.title}</h2>
                  <p className="text-sm text-gray-600">Forslag {forslag.id}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {forslag.description}
              </p>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Hovedfunksjoner:</h3>
                <ul className="space-y-1">
                  {forslag.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Best for:</h3>
                <p className="text-sm text-gray-600 italic">{forslag.bestFor}</p>
              </div>

              <Link
                to={forslag.path}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-white text-gray-900 font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                Se demo
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Sammenligning</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Funksjon</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-700">Kanban</th>
                <th className="text-center py-3 px-4 font-semibold text-green-700">Liste</th>
                <th className="text-center py-3 px-4 font-semibold text-purple-700">Kalender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-gray-700">Visuell oversikt</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Databehandling</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Tidsplanlegging</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Arbeidsflyt</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Mobilbruk</td>
                <td className="py-3 px-4 text-center">⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
                <td className="py-3 px-4 text-center">⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Klikk på "Se demo" for å teste hver tilnærming med ekte data og funksjoner.
        </p>
      </div>
    </div>
  );
} 
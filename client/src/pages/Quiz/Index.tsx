import React from 'react';
import { Link } from 'react-router-dom';
import { FaListAlt, FaBook, FaTags, FaPlusCircle, FaClipboardList, FaPlay } from 'react-icons/fa';

const DASHBOARD_LINKS = [
  {
    to: '/quiz/ta-quiz',
    icon: <FaPlay size={32} className="text-green-700" />,
    title: 'Ta Quiz',
    desc: 'Start en quiz basert på eksisterende spørsmål.',
    color: 'green'
  },
  {
    to: '/quiz/oversikt/opprett-quiz',
    icon: <FaListAlt size={32} className="text-blue-700" />,
    title: 'Quizoversikt',
    desc: 'Se alle quizer, administrer og start quiz.',
    color: 'blue'
  },
  {
    to: '/quiz/oversikt/sporsmalsbibliotek',
    icon: <FaBook size={32} className="text-blue-700" />,
    title: 'Spørsmålsbibliotek',
    desc: 'Se og administrer alle spørsmål.',
    color: 'blue'
  },
  {
    to: '/quiz/oversikt/kategorier',
    icon: <FaTags size={32} className="text-blue-700" />,
    title: 'Kategorier',
    desc: 'Administrer kategorier for spørsmål.',
    color: 'blue'
  },
  {
    to: '/quiz/oversikt/opprett-sporsmal',
    icon: <FaPlusCircle size={32} className="text-blue-700" />,
    title: 'Opprett spørsmål',
    desc: 'Legg til nye spørsmål i biblioteket.',
    color: 'blue'
  },
  {
    to: '/quiz/oversikt/bildebibliotek',
    icon: <FaClipboardList size={32} className="text-blue-700" />,
    title: 'Bildebibliotek',
    desc: 'Administrer bilder for spørsmål.',
    color: 'blue'
  },
];

export default function Quiz() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Quiz-dashbord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {DASHBOARD_LINKS.map(link => (
          <Link
            to={link.to}
            key={link.title}
            className={`${link.color === 'green' ? 'bg-green-50 hover:bg-green-100' : 'bg-blue-50 hover:bg-blue-100'} transition-colors rounded-xl p-6 flex flex-col items-center shadow group`}
          >
            {link.icon}
            <div className={`mt-4 text-xl font-semibold ${link.color === 'green' ? 'text-green-900' : 'text-blue-900'} group-hover:underline`}>{link.title}</div>
            <div className={`${link.color === 'green' ? 'text-green-700' : 'text-blue-700'} text-center mt-2 text-sm`}>{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
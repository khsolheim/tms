import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sporsmalsbibliotek from './Sporsmalsbibliotek';
import Kategorier from './Kategorier';
import OpprettSporsmal from './OpprettSporsmal';
import OpprettQuiz from './OpprettQuiz';
import Bildebibliotek from './Bildebibliotek';

const TABS = [
  { key: 'sporsmalsbibliotek', label: 'Spørsmålsbibliotek' },
  { key: 'kategorier', label: 'Kategorier' },
  { key: 'opprett-sporsmal', label: 'Opprett spørsmål' },
  { key: 'opprett-quiz', label: 'Opprett quiz' },
  { key: 'bildebibliotek', label: 'Bildebibliotek' },
];

export default function QuizOversikt() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sporsmalsbibliotek');

  useEffect(() => {
    // Sjekk om tab-parameteren er gyldig
    if (tab && TABS.some(t => t.key === tab)) {
      setActiveTab(tab);
    } else if (tab) {
      // Ugyldig tab, redirect til standard
      navigate('/quiz/oversikt/sporsmalsbibliotek', { replace: true });
    } else {
      // Ingen tab spesifisert, redirect til standard
      navigate('/quiz/oversikt/sporsmalsbibliotek', { replace: true });
    }
  }, [tab, navigate]);

  const handleTabChange = (tabKey: string) => {
    navigate(`/quiz/oversikt/${tabKey}`);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-4 border-b border-blue-200 mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === t.key 
                  ? 'border-blue-700 text-blue-700' 
                  : 'border-transparent text-blue-400 hover:text-blue-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {activeTab === 'sporsmalsbibliotek' && <Sporsmalsbibliotek />}
        {activeTab === 'kategorier' && <Kategorier />}
        {activeTab === 'opprett-sporsmal' && <OpprettSporsmal />}
        {activeTab === 'opprett-quiz' && <OpprettQuiz />}
        {activeTab === 'bildebibliotek' && <Bildebibliotek />}
      </div>
    </div>
  );
} 
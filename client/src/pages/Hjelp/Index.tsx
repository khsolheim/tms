import React, { useState, useEffect } from 'react';
import { 
  FaQuestionCircle,
  FaBook,
  FaTicketAlt,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaHeadset
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { hjelpService, FAQItem, HjelpKategori, KontaktInfo } from '../../services/hjelp.service';

export default function Hjelp() {
  const [activeTab, setActiveTab] = useState<'faq' | 'kontakt'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [søketerm, setSøketerm] = useState('');
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [kategorier, setKategorier] = useState<HjelpKategori[]>([]);
  const [kontakt, setKontakt] = useState<KontaktInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lastHjelpData();
  }, []);

  const lastHjelpData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Bruker mock data for utvikling
      const data = await hjelpService.hentMockData();
      setFaq(data.faq);
      setKategorier(data.kategorier);
      setKontakt(data.kontakt);
    } catch (err) {
      setError('Kunne ikke laste hjelp-data');
      console.error('Feil ved lasting av hjelp-data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQ = faq.filter((item: FAQItem) => 
    item.spørsmål.toLowerCase().includes(søketerm.toLowerCase()) ||
    item.svar.toLowerCase().includes(søketerm.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <FaQuestionCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hjelp & Support</h1>
            <p className="text-gray-600">Finn svar på dine spørsmål eller få hjelp fra vårt supportteam</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('faq')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaQuestionCircle className={`mr-2 h-5 w-5 ${
              activeTab === 'faq' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('kontakt')}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'kontakt'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaHeadset className={`mr-2 h-5 w-5 ${
              activeTab === 'kontakt' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            Kontakt oss
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="cards-spacing-vertical">
            {/* Søk */}
            <div className="bg-white shadow rounded-lg px-2 py-1">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={søketerm}
                  onChange={(e) => setSøketerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Søk i FAQ..."
                />
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-2 py-1 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Ofte stilte spørsmål</h3>
              </div>
              
              <div className="px-2 py-1">
                <div className="cards-spacing-vertical">
                  {filteredFAQ.map((item: FAQItem) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFAQ(item.id)}
                        className="w-full px-2 py-1 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{item.spørsmål}</span>
                        {expandedFAQ === item.id ? (
                          <FaChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <FaChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedFAQ === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200"
                          >
                            <div className="px-2 py-1 text-gray-700">
                              {item.svar}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kontakt Tab */}
        {activeTab === 'kontakt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
            <div className="bg-white shadow rounded-lg px-2 py-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Kontaktinformasjon</h3>
              
              <div className="cards-spacing-vertical">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FaPhone className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Telefon</h4>
                    <p className="text-gray-600">{kontakt?.telefon || '+47 123 45 678'}</p>
                    <p className="text-sm text-gray-500">Hverdager {kontakt?.åpningstider.mandag || '08:00-16:00'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FaEnvelope className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">E-post</h4>
                    <p className="text-gray-600">{kontakt?.epost || 'support@tms.no'}</p>
                    <p className="text-sm text-gray-500">Svar innen 2-4 timer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg px-2 py-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Send en melding</h3>
              
              <form className="cards-spacing-vertical">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emne
                  </label>
                  <input
                    type="text"
                    className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Beskriv kort hva du trenger hjelp med"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beskrivelse
                  </label>
                  <textarea
                    rows={4}
                    className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Beskriv problemet eller spørsmålet ditt detaljert..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Send melding
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 
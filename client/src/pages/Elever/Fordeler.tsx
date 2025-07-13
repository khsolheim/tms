import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Eye, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Star,
  Gift,
  Tag,
  Calendar,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Annonse {
  id: number;
  tittel: string;
  innledning: string;
  fullInnhold: string;
  bildeUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaTelefon?: string;
  ctaEpost?: string;
  ctaVeibeskrivelse?: string;
  prioritet: number;
  startDato: string;
  sluttDato?: string;
  annonsor: {
    id: number;
    navn: string;
    type: 'ANNONSOR' | 'SPONSOR';
    nettside?: string;
  };
  targeting: Array<{
    geografisk?: {
      type: string;
      navn: string;
    };
    skole?: {
      navn: string;
    };
  }>;
}

export default function Fordeler() {
  const [annonser, setAnnonser] = useState<Annonse[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALLE' | 'ANNONSOR' | 'SPONSOR'>('ALLE');

  useEffect(() => {
    fetchAnnonser();
  }, []);

  const fetchAnnonser = async () => {
    try {
      setLoading(true);
      const elevId = getCurrentElevId(); // Få elevID fra brukerkontext
      
      const response = await fetch(`/api/annonsor/elev-annonser?elevId=${elevId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnonser(data);
      } else {
        toast.error('Kunne ikke hente fordeler');
      }
    } catch (error) {
      console.error('Feil ved henting av annonser:', error);
      toast.error('Feil ved lasting av fordeler');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentElevId = () => {
    // Dette skulle egentlig komme fra brukerkontext
    // For demo-formål bruker vi en hardkodet verdi
    return 1;
  };

  const registrerInteraksjon = async (annonseId: number, type: string) => {
    try {
      await fetch('/api/annonsor/registrer-interaksjon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          annonseId,
          elevId: getCurrentElevId(),
          interaksjonsType: type
        })
      });
    } catch (error) {
      console.error('Feil ved registrering av interaksjon:', error);
    }
  };

  const handleCardView = (annonseId: number) => {
    registrerInteraksjon(annonseId, 'VISNING');
  };

  const handleExpand = (annonseId: number) => {
    const newExpanded = new Set(expandedCards);
    if (expandedCards.has(annonseId)) {
      newExpanded.delete(annonseId);
    } else {
      newExpanded.add(annonseId);
      registrerInteraksjon(annonseId, 'EKSPANDERT');
    }
    setExpandedCards(newExpanded);
  };

  const handleAction = (annonseId: number, actionType: string, url?: string) => {
    registrerInteraksjon(annonseId, actionType);
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  const filteredAnnonser = annonser.filter(annonse => {
    if (filter === 'ALLE') return true;
    return annonse.annonsor.type === filter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SPONSOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ANNONSOR': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (prioritet: number) => {
    if (prioritet >= 4) return <Star className="w-4 h-4 text-yellow-500" />;
    if (prioritet >= 3) return <Gift className="w-4 h-4 text-blue-500" />;
    return <Tag className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster fordeler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Elevfordeler</h1>
            <p className="text-lg text-gray-600">Oppddag eksklusive tilbud og rabatter fra våre partnere</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setFilter('ALLE')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'ALLE' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilter('SPONSOR')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'SPONSOR' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Sponsorer
              </button>
              <button
                onClick={() => setFilter('ANNONSOR')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'ANNONSOR' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annonser
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredAnnonser.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
            <Gift className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen fordeler tilgjengelig</h3>
          <p className="text-gray-600">Det er ingen aktive tilbud for øyeblikket. Kom tilbake senere!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnonser.map((annonse) => (
            <Card 
              key={annonse.id} 
              className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
              onMouseEnter={() => handleCardView(annonse.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(annonse.prioritet)}
                    <Badge className={`${getTypeColor(annonse.annonsor.type)} text-xs`}>
                      {annonse.annonsor.type === 'SPONSOR' ? 'Sponsor' : 'Annonse'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{annonse.annonsor.navn}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Building className="w-3 h-3 mr-1" />
                      {annonse.targeting.length > 0 && annonse.targeting[0].geografisk?.navn}
                    </p>
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 mt-3">
                  {annonse.tittel}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {annonse.bildeUrl && (
                  <img 
                    src={annonse.bildeUrl} 
                    alt={annonse.tittel}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {annonse.innledning}
                </p>

                {expandedCards.has(annonse.id) && (
                  <div className="mb-4">
                    <div 
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: annonse.fullInnhold }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleExpand(annonse.id)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {expandedCards.has(annonse.id) ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Vis mindre
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Vis mer
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {annonse.sluttDato ? `Gyldig til ${new Date(annonse.sluttDato).toLocaleDateString('nb-NO')}` : 'Ingen utløpsdato'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {annonse.ctaUrl && (
                    <Button
                      onClick={() => handleAction(annonse.id, 'KLIKK', annonse.ctaUrl)}
                      className="flex items-center text-sm bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {annonse.ctaText || 'Besøk'}
                    </Button>
                  )}
                  
                  {annonse.ctaTelefon && (
                    <Button
                      onClick={() => handleAction(annonse.id, 'TELEFON', `tel:${annonse.ctaTelefon}`)}
                      variant="outline"
                      className="flex items-center text-sm"
                      size="sm"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Ring
                    </Button>
                  )}
                  
                  {annonse.ctaEpost && (
                    <Button
                      onClick={() => handleAction(annonse.id, 'EPOST', `mailto:${annonse.ctaEpost}`)}
                      variant="outline"
                      className="flex items-center text-sm"
                      size="sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      E-post
                    </Button>
                  )}
                  
                  {annonse.ctaVeibeskrivelse && (
                    <Button
                      onClick={() => handleAction(annonse.id, 'VEIBESKRIVELSE', `https://maps.google.com/maps?q=${encodeURIComponent(annonse.ctaVeibeskrivelse)}`)}
                      variant="outline"
                      className="flex items-center text-sm"
                      size="sm"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Veibeskrivelse
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
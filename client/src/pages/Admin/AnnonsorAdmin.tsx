import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Edit, 
  Eye, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnnonsorSponsor {
  id: number;
  navn: string;
  type: 'ANNONSOR' | 'SPONSOR';
  kontaktperson?: string;
  telefon?: string;
  epost?: string;
  nettside?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  aktiv: boolean;
  startDato: string;
  sluttDato?: string;
  budsjett?: number;
  kostnadPerVisning?: number;
  kostnadPerKlikk?: number;
  opprettet: string;
  annonser: Array<{
    id: number;
    tittel: string;
    aktiv: boolean;
    statistikk: Array<{
      antallVisninger: number;
      antallKlikk: number;
      dato: string;
    }>;
  }>;
}

export default function AnnonsorAdmin() {
  const [sponsorer, setSponsorer] = useState<AnnonsorSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALLE');
  const [selectedType, setSelectedType] = useState<string>('ALLE');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSponsorer();
  }, []);

  const fetchSponsorer = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/annonsor/sponsorer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSponsorer(data);
      } else {
        toast.error('Kunne ikke hente annonsører/sponsorer');
      }
    } catch (error) {
      console.error('Feil ved henting av sponsorer:', error);
      toast.error('Feil ved lasting av data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, action: 'godkjenn' | 'avvis', grunn?: string) => {
    try {
      const endpoint = action === 'godkjenn' ? 'godkjenn' : 'avvis';
      const body = action === 'avvis' ? { grunn } : {};
      
      const response = await fetch(`/api/annonsor/sponsorer/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        toast.success(`Annonsør/sponsor ${action === 'godkjenn' ? 'godkjent' : 'avvist'}`);
        fetchSponsorer();
      } else {
        toast.error('Feil ved oppdatering av status');
      }
    } catch (error) {
      console.error('Feil ved statusendring:', error);
      toast.error('Feil ved oppdatering');
    }
  };

  const filteredSponsorer = sponsorer.filter(sponsor => {
    const statusMatch = selectedStatus === 'ALLE' || sponsor.status === selectedStatus;
    const typeMatch = selectedType === 'ALLE' || sponsor.type === selectedType;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Godkjent';
      case 'PENDING': return 'Venter';
      case 'REJECTED': return 'Avvist';
      case 'SUSPENDED': return 'Suspendert';
      default: return 'Ukjent';
    }
  };

  const calculateTotalStats = (annonser: any[]) => {
    let totalVisninger = 0;
    let totalKlikk = 0;
    
    annonser.forEach(annonse => {
      annonse.statistikk.forEach((stat: any) => {
        totalVisninger += stat.antallVisninger;
        totalKlikk += stat.antallKlikk;
      });
    });
    
    return { totalVisninger, totalKlikk };
  };

  const overallStats = {
    totalSponsorer: sponsorer.length,
    activeSponsorer: sponsorer.filter(s => s.aktiv).length,
    pendingApproval: sponsorer.filter(s => s.status === 'PENDING').length,
    totalBudget: sponsorer.reduce((sum, s) => sum + (s.budsjett || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster annonsører og sponsorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonsør & Sponsor Administrasjon</h1>
          <p className="text-lg text-gray-600">Administrer annonsører, sponsorer og deres tilbud</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ny Annonsør/Sponsor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalSponsorer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.activeSponsorer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Venter godkjenning</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.pendingApproval}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total budsjett</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalBudget.toLocaleString('nb-NO')} kr</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex rounded-lg border border-gray-200 p-1">
          {['ALLE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {status === 'ALLE' ? 'Alle statuser' : getStatusText(status)}
            </button>
          ))}
        </div>
        
        <div className="flex rounded-lg border border-gray-200 p-1">
          {['ALLE', 'SPONSOR', 'ANNONSOR'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {type === 'ALLE' ? 'Alle typer' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Sponsors List */}
      {filteredSponsorer.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen annonsører/sponsorer funnet</h3>
          <p className="text-gray-600">Opprett en ny eller juster filtere</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSponsorer.map((sponsor) => {
            const stats = calculateTotalStats(sponsor.annonser);
            return (
              <Card key={sponsor.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl">{sponsor.navn}</CardTitle>
                        <Badge className={getStatusColor(sponsor.status)}>
                          {getStatusText(sponsor.status)}
                        </Badge>
                        <Badge variant="outline">
                          {sponsor.type}
                        </Badge>
                        {!sponsor.aktiv && (
                          <Badge variant="destructive">Inaktiv</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {sponsor.kontaktperson && (
                          <p><strong>Kontakt:</strong> {sponsor.kontaktperson}</p>
                        )}
                        {sponsor.epost && (
                          <p><strong>E-post:</strong> {sponsor.epost}</p>
                        )}
                        {sponsor.telefon && (
                          <p><strong>Telefon:</strong> {sponsor.telefon}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Vis
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Rediger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Statistikk
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informasjon</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Opprettet: {new Date(sponsor.opprettet).toLocaleDateString('nb-NO')}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>Periode: {new Date(sponsor.startDato).toLocaleDateString('nb-NO')} - {sponsor.sluttDato ? new Date(sponsor.sluttDato).toLocaleDateString('nb-NO') : 'Løpende'}</span>
                        </div>
                        {sponsor.budsjett && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                            <span>Budsjett: {sponsor.budsjett.toLocaleString('nb-NO')} kr</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ytelse</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Annonser:</span>
                          <span className="font-medium">{sponsor.annonser.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Visninger:</span>
                          <span className="font-medium">{stats.totalVisninger.toLocaleString('nb-NO')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Klikk:</span>
                          <span className="font-medium">{stats.totalKlikk.toLocaleString('nb-NO')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">CTR:</span>
                          <span className="font-medium">
                            {stats.totalVisninger > 0 ? ((stats.totalKlikk / stats.totalVisninger) * 100).toFixed(2) + '%' : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Handlinger</h4>
                      <div className="space-y-2">
                        {sponsor.status === 'PENDING' && (
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleStatusChange(sponsor.id, 'godkjenn')}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Godkjenn
                            </Button>
                            <Button
                              onClick={() => handleStatusChange(sponsor.id, 'avvis', 'Oppfyller ikke krav')}
                              variant="destructive"
                              className="w-full text-sm"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Avvis
                            </Button>
                          </div>
                        )}
                        
                        {sponsor.status === 'APPROVED' && (
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ny annonse
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Home, 
  BookOpen, 
  Shield, 
  Building, 
  Users, 
  FileText, 
  Calendar, 
  Newspaper, 
  CheckSquare, 
  BarChart3, 
  DollarSign, 
  UserCheck, 
  Folder, 
  Cpu,
  Settings,
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface PageDefinition {
  id: number;
  pageKey: string;
  pageName: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  requiresSubscription: boolean;
  subscriptionTier: string;
}

interface BedriftPageAccess {
  id: number;
  bedriftId: number;
  pageKey: string;
  isEnabled: boolean;
  enabledAt: string;
  disabledAt: string;
  enabledBy: number;
  notes: string;
  page: PageDefinition;
  enabledByUser?: {
    id: number;
    navn: string;
    epost: string;
  };
}

interface PageAccessHistory {
  id: number;
  bedriftId: number;
  pageKey: string;
  action: string;
  performedBy: number;
  reason: string;
  performedAt: string;
  performedByUser?: {
    id: number;
    navn: string;
    epost: string;
  };
}

interface Bedrift {
  id: number;
  navn: string;
  organisasjonsnummer: string;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    home: Home,
    'book-open': BookOpen,
    'shield-check': Shield,
    building: Building,
    users: Users,
    'file-text': FileText,
    calendar: Calendar,
    newspaper: Newspaper,
    'check-square': CheckSquare,
    'bar-chart-3': BarChart3,
    'dollar-sign': DollarSign,
    'user-check': UserCheck,
    folder: Folder,
    cpu: Cpu,
  };
  
  return icons[iconName] || Settings;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'core':
      return 'bg-green-100 text-green-800';
    case 'premium':
      return 'bg-blue-100 text-blue-800';
    case 'enterprise':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface PageAccessManagerProps {
  bedriftId: number;
  bedriftNavn: string;
}

export default function PageAccessManager({ bedriftId, bedriftNavn }: PageAccessManagerProps) {
  const [pageAccess, setPageAccess] = useState<BedriftPageAccess[]>([]);
  const [history, setHistory] = useState<PageAccessHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPageAccess();
    fetchHistory();
  }, [bedriftId]);

  const fetchPageAccess = async () => {
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/pages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPageAccess(data);
      } else {
        toast.error('Kunne ikke hente side-tilgang');
      }
    } catch (error) {
      toast.error('Feil ved henting av side-tilgang');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/page-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Feil ved henting av historikk:', error);
    }
  };

  const updatePageAccess = async (pageKey: string, isEnabled: boolean) => {
    setUpdating(pageKey);
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/pages/${pageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isEnabled,
          notes: notes[pageKey] || ''
        })
      });

      if (response.ok) {
        toast.success(`${isEnabled ? 'Aktivert' : 'Deaktivert'} ${pageKey}`);
        fetchPageAccess();
        fetchHistory();
      } else {
        toast.error('Kunne ikke oppdatere side-tilgang');
      }
    } catch (error) {
      toast.error('Feil ved oppdatering av side-tilgang');
    } finally {
      setUpdating(null);
    }
  };

  const groupedPages = pageAccess.reduce((acc, access) => {
    const category = access.page.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(access);
    return acc;
  }, {} as { [key: string]: BedriftPageAccess[] });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Side-tilgang for {bedriftNavn}</h2>
          <p className="text-gray-600">Administrer hvilke sider som er tilgjengelige for bedriften</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4 mr-2" />
              Vis historikk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Side-tilgang historikk</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Side</TableHead>
                    <TableHead>Handling</TableHead>
                    <TableHead>Utført av</TableHead>
                    <TableHead>Dato</TableHead>
                    <TableHead>Årsak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.pageKey}</TableCell>
                      <TableCell>
                        <Badge variant={item.action === 'enabled' ? 'default' : 'secondary'}>
                          {item.action === 'enabled' ? 'Aktivert' : 'Deaktivert'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.performedByUser?.navn || 'Ukjent'}</TableCell>
                      <TableCell>{new Date(item.performedAt).toLocaleString('nb-NO')}</TableCell>
                      <TableCell>{item.reason || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core">Kjerne</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          <TabsTrigger value="other">Andre</TabsTrigger>
        </TabsList>

        {Object.entries(groupedPages).map(([category, pages]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((access) => {
                const IconComponent = getIconComponent(access.page.icon);
                return (
                  <Card key={access.pageKey} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{access.page.pageName}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(access.page.category)}>
                            {access.page.category}
                          </Badge>
                          {access.page.requiresSubscription && (
                            <Badge variant="outline">
                              {access.page.subscriptionTier}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{access.page.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`toggle-${access.pageKey}`}>Tilgjengelig</Label>
                        <Switch
                          id={`toggle-${access.pageKey}`}
                          checked={access.isEnabled}
                          onCheckedChange={(checked: boolean) => updatePageAccess(access.pageKey, checked)}
                          disabled={updating === access.pageKey}
                        />
                      </div>

                      {access.isEnabled && (
                        <div className="space-y-2">
                          <Label htmlFor={`notes-${access.pageKey}`}>Notater</Label>
                          <Textarea
                            id={`notes-${access.pageKey}`}
                            placeholder="Legg til notater om denne endringen..."
                            value={notes[access.pageKey] || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(prev => ({
                              ...prev,
                              [access.pageKey]: e.target.value
                            }))}
                            rows={2}
                          />
                        </div>
                      )}

                      {access.enabledAt && (
                        <div className="text-xs text-gray-500">
                          Aktivert: {new Date(access.enabledAt).toLocaleDateString('nb-NO')}
                          {access.enabledByUser && ` av ${access.enabledByUser.navn}`}
                        </div>
                      )}

                      {access.notes && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notater:</strong> {access.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {Object.keys(groupedPages).length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Ingen sider funnet for denne bedriften</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
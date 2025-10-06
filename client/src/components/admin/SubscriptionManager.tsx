import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CreditCard, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  History,
  Settings,
  DollarSign,
  Crown,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string;
  maxUsers: number;
  maxBedrifter: number;
  isActive: boolean;
  subscriptionFeatures: SubscriptionFeature[];
}

interface SubscriptionFeature {
  id: number;
  planId: number;
  featureKey: string;
  featureName: string;
  description: string;
  isIncluded: boolean;
  limitValue: number;
}

interface BedriftSubscription {
  id: number;
  bedriftId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate: string;
  nextPaymentDate: string;
  plan: SubscriptionPlan;
}

interface SubscriptionHistory {
  id: number;
  bedriftId: number;
  planId: number;
  action: string;
  oldPlanId: number;
  newPlanId: number;
  performedBy: number;
  notes: string;
  performedAt: string;
  plan: SubscriptionPlan;
  oldPlan?: SubscriptionPlan;
  newPlan?: SubscriptionPlan;
  performedByUser?: {
    id: number;
    navn: string;
    epost: string;
  };
}

interface SubscriptionManagerProps {
  bedriftId: number;
  bedriftNavn: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-orange-100 text-orange-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    case 'expired':
      return Clock;
    case 'suspended':
      return AlertTriangle;
    default:
      return Settings;
  }
};

const getPlanIcon = (planName: string) => {
  switch (planName.toLowerCase()) {
    case 'basic':
      return Star;
    case 'premium':
      return Crown;
    case 'enterprise':
      return DollarSign;
    default:
      return CreditCard;
  }
};

export default function SubscriptionManager({ bedriftId, bedriftNavn }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<BedriftSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    fetchHistory();
  }, [bedriftId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/subscription`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      toast.error('Feil ved henting av abonnement');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      toast.error('Feil ved henting av abonnementsplaner');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/subscription-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Feil ved henting av abonnementshistorikk:', error);
    }
  };

  const updateSubscription = async () => {
    if (!selectedPlanId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/bedrifter/${bedriftId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          status: 'active',
          notes
        })
      });

      if (response.ok) {
        toast.success('Abonnement oppdatert');
        setShowUpdateDialog(false);
        setSelectedPlanId(null);
        setNotes('');
        fetchSubscription();
        fetchHistory();
      } else {
        toast.error('Kunne ikke oppdatere abonnement');
      }
    } catch (error) {
      toast.error('Feil ved oppdatering av abonnement');
    } finally {
      setUpdating(false);
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
          <h2 className="text-2xl font-bold">Abonnement for {bedriftNavn}</h2>
          <p className="text-gray-600">Administrer bedriftens abonnementsplan</p>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                Vis historikk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Abonnementshistorikk</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Handling</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Utført av</TableHead>
                      <TableHead>Dato</TableHead>
                      <TableHead>Notater</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {item.action === 'started' && 'Startet'}
                            {item.action === 'upgraded' && 'Oppgradert'}
                            {item.action === 'downgraded' && 'Nedgradert'}
                            {item.action === 'cancelled' && 'Kansellert'}
                            {item.action === 'renewed' && 'Fornyet'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.plan.name}</TableCell>
                        <TableCell>{item.performedByUser?.navn || 'Ukjent'}</TableCell>
                        <TableCell>{new Date(item.performedAt).toLocaleString('nb-NO')}</TableCell>
                        <TableCell>{item.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                {subscription ? 'Oppdater abonnement' : 'Aktiver abonnement'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {subscription ? 'Oppdater abonnement' : 'Aktiver abonnement'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan">Velg plan</Label>
                  <Select value={selectedPlanId?.toString()} onValueChange={(value: string) => setSelectedPlanId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg en plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => {
                        const PlanIcon = getPlanIcon(plan.name);
                        return (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <PlanIcon className="w-4 h-4" />
                              <span>{plan.name}</span>
                              <span className="text-gray-500">- {plan.priceMonthly}kr/mnd</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notater</Label>
                  <Textarea
                    id="notes"
                    placeholder="Legg til notater om denne endringen..."
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={updateSubscription} disabled={!selectedPlanId || updating}>
                    {updating ? 'Oppdaterer...' : 'Oppdater'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {subscription ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nåværende abonnement</CardTitle>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status === 'active' && 'Aktiv'}
                  {subscription.status === 'cancelled' && 'Kansellert'}
                  {subscription.status === 'expired' && 'Utløpt'}
                  {subscription.status === 'suspended' && 'Suspenderte'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                {(() => {
                  const PlanIcon = getPlanIcon(subscription.plan.name);
                  return <PlanIcon className="w-5 h-5 text-blue-600" />;
                })()}
                <div>
                  <h3 className="font-semibold">{subscription.plan.name}</h3>
                  <p className="text-sm text-gray-600">{subscription.plan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Pris:</span>
                  <p className="font-medium">{subscription.plan.priceMonthly}kr/mnd</p>
                </div>
                <div>
                  <span className="text-gray-500">Maks brukere:</span>
                  <p className="font-medium">{subscription.plan.maxUsers || 'Ubegrenset'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Startdato:</span>
                  <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString('nb-NO')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Sluttdato:</span>
                  <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString('nb-NO')}</p>
                </div>
              </div>

              {subscription.status === 'active' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {getDaysUntilExpiry(subscription.endDate)} dager til fornyelse
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Inkluderte funksjoner:</h4>
                <div className="space-y-1">
                  {subscription.plan.subscriptionFeatures
                    .filter(feature => feature.isIncluded)
                    .map((feature) => (
                      <div key={feature.id} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{feature.featureName}</span>
                        {feature.limitValue && (
                          <Badge variant="outline" className="text-xs">
                            {feature.limitValue}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tilgjengelige planer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.map((plan) => {
                const PlanIcon = getPlanIcon(plan.name);
                const isCurrentPlan = subscription.planId === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg ${
                      isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PlanIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">{plan.name}</h3>
                        {isCurrentPlan && (
                          <Badge variant="outline">Nåværende</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{plan.priceMonthly}kr</p>
                        <p className="text-xs text-gray-500">per måned</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    
                    <div className="space-y-1">
                      {plan.subscriptionFeatures
                        .filter(feature => feature.isIncluded)
                        .slice(0, 3)
                        .map((feature) => (
                          <div key={feature.id} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>{feature.featureName}</span>
                          </div>
                        ))}
                      {plan.subscriptionFeatures.filter(feature => feature.isIncluded).length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{plan.subscriptionFeatures.filter(feature => feature.isIncluded).length - 3} flere funksjoner
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ingen aktivt abonnement</h3>
              <p className="text-gray-600 mb-4">
                Denne bedriften har ikke noe aktivt abonnement. Aktiver et abonnement for å få tilgang til premium-funksjoner.
              </p>
              <Button onClick={() => setShowUpdateDialog(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Aktiver abonnement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
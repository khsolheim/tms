import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  CheckCircle,
  XCircle,
  CreditCard,
  Crown,
  Star
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
}

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

export default function PageAccessOverview() {
  const [pageAccess, setPageAccess] = useState<BedriftPageAccess[]>([]);
  const [subscription, setSubscription] = useState<BedriftSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageAccess();
    fetchSubscription();
  }, []);

  const fetchPageAccess = async () => {
    try {
      const response = await fetch('/api/bedrift/pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPageAccess(data);
      } else {
        toast.error('Kunne ikke hente tilgjengelige sider');
      }
    } catch (error) {
      toast.error('Feil ved henting av sider');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/bedrift/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Feil ved henting av abonnement:', error);
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
      <div>
        <h2 className="text-2xl font-bold">Tilgjengelige sider</h2>
        <p className="text-gray-600">Oversikt over sider og funksjoner tilgjengelige for din bedrift</p>
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Abonnementsstatus</CardTitle>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              {(() => {
                const PlanIcon = getPlanIcon(subscription.plan.name);
                return <PlanIcon className="w-8 h-8 text-blue-600" />;
              })()}
              <div>
                <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                <p className="text-sm text-gray-600">{subscription.plan.description}</p>
              </div>
            </div>
            
            {subscription.status === 'active' && (
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getDaysUntilExpiry(subscription.endDate)} dager til fornyelse
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                const isAvailable = access.isEnabled;
                
                return (
                  <Card key={access.pageKey} className={`relative ${!isAvailable ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{access.page.pageName}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAvailable ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
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
                    <CardContent>
                      {!isAvailable && access.page.requiresSubscription && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center space-x-2 text-yellow-800">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Krever {access.page.subscriptionTier} abonnement
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {isAvailable && (
                        <Button className="w-full" variant="outline">
                          Åpne {access.page.pageName}
                        </Button>
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
              <h3 className="text-lg font-semibold mb-2">Ingen sider tilgjengelige</h3>
              <p className="text-gray-600">
                Kontakt administrator for å få tilgang til sider og funksjoner.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Inkluderte funksjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {subscription.plan.subscriptionFeatures
                .filter(feature => feature.isIncluded)
                .map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature.featureName}</span>
                    {feature.limitValue && (
                      <Badge variant="outline" className="text-xs">
                        {feature.limitValue}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Building, FileText } from 'lucide-react';

interface MetricsCardProps {
  config: {
    type: 'bedrifter' | 'elever' | 'kontrakter' | 'oppgaver';
    value: number;
    change: number;
    period: string;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ config }) => {
  const getIcon = () => {
    switch (config.type) {
      case 'bedrifter':
        return <Building className="h-8 w-8 text-blue-600" />;
      case 'elever':
        return <Users className="h-8 w-8 text-green-600" />;
      case 'kontrakter':
        return <FileText className="h-8 w-8 text-purple-600" />;
      default:
        return <TrendingUp className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (config.type) {
      case 'bedrifter':
        return 'Aktive Bedrifter';
      case 'elever':
        return 'Registrerte Elever';
      case 'kontrakter':
        return 'Aktive Kontrakter';
      default:
        return 'Oppgaver';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{getTitle()}</p>
            <p className="text-2xl font-bold text-gray-900">{config.value}</p>
            <div className="flex items-center mt-2">
              {config.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ml-1 ${config.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(config.change)}% {config.period}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
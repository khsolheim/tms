import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, Users } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const quickActions = [
    {
      label: 'Ny oppgave',
      icon: Plus,
      href: '/oppgaver/ny',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Kalender',
      icon: Calendar,
      href: '/kalender',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Ny artikkel',
      icon: FileText,
      href: '/nyheter/ny',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Ny elev',
      icon: Users,
      href: '/elever/ny',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="flex space-x-2">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          className={`${action.color} text-white`}
          size="sm"
        >
          <action.icon className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};
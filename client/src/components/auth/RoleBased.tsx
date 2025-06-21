import React from 'react';
import { useAuth } from '../../contexts';
import type { Rolle } from '../../types';

interface Props {
  children: React.ReactNode;
  roles?: Rolle[];
  tilganger?: string[];
  fallback?: React.ReactNode;
}

export default function RoleBased({ 
  children, 
  roles = [], 
  tilganger = [], 
  fallback = null 
}: Props) {
  const { bruker } = useAuth();

  if (!bruker) {
    return <>{fallback}</>;
  }

  // Admin har tilgang til alt
  if (bruker.rolle === 'ADMIN') {
    return <>{children}</>;
  }

  // Sjekk rolletilgang hvis spesifisert
  if (roles.length > 0 && !roles.includes(bruker.rolle)) {
    return <>{fallback}</>;
  }

  // Sjekk spesifikke tilganger hvis spesifisert
  if (tilganger.length > 0 && !tilganger.some(t => bruker.tilganger.includes(t))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 
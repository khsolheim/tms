import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import type { Rolle } from '../../types';

interface Props {
  children: React.ReactNode;
  roles: Rolle[];
}

export default function RoleRoute({ children, roles }: Props) {
  const { bruker, erInnlogget } = useAuth();

  if (!erInnlogget) {
    return <Navigate to="/logg-inn" />;
  }

  if (!bruker || !roles.includes(bruker.rolle)) {
    return <Navigate to="/oversikt" />;
  }

  return <>{children}</>;
} 
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { erInnlogget } = useAuth();

  if (!erInnlogget) {
    return <Navigate to="/logg-inn" />;
  }

  return <>{children}</>;
} 
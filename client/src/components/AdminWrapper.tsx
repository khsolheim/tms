import React from 'react';
import { AdminLayout } from './admin/layout/AdminLayout';

interface AdminWrapperProps {
  children: React.ReactNode;
}

export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}; 
import React from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from '../../contexts';
import { Alert } from './index';
import { FaExclamationTriangle } from 'react-icons/fa';
// Removed unused imports: FiLogOut

export default function Layout({ children }: { children: React.ReactNode }) {
  const { erInnlogget, erImpersonert, bruker, stopImpersonate } = useAuth();
  // Removed unused variables: loggUt, handleLoggUt

  const handleStoppImpersonate = async () => {
    try {
      await stopImpersonate();
    } catch (error) {
      alert('Kunne ikke gå tilbake til admin konto. Prøv igjen.');
    }
  };

  if (!erInnlogget) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#e9eef6]">
      <Header />
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="sticky top-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <Sidebar />
        </div>
        <main className="flex-1 bg-white overflow-y-auto">
          <section className="flex-1 flex flex-col cards-spacing-grid bg-white p-4">
            {children || <Outlet />}
          </section>
        </main>
      </div>
    </div>
  );
} 
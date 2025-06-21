import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface MobileMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  adminOnly?: boolean;
}

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { actualTheme } = useTheme();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems: MobileMenuItem[] = [
    {
      id: 'oversikt',
      label: 'Oversikt',
      href: '/oversikt',
      icon: HomeIcon,
      description: 'Dashboard og hovedoversikt'
    },
    {
      id: 'bedrifter',
      label: 'Bedrifter',
      href: '/bedrifter',
      icon: BuildingOfficeIcon,
      description: 'Bedriftshåndtering og oversikt'
    },
    {
      id: 'kontrakter',
      label: 'Kontrakter',
      href: '/kontrakter',
      icon: DocumentTextIcon,
      description: 'Kontraktadministrasjon'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      href: '/quiz',
      icon: AcademicCapIcon,
      description: 'Quizsystem og testing'
    },
    {
      id: 'sikkerhetskontroll-laering',
      label: 'Sikkerhetskontroll Læring',
      href: '/sikkerhetskontroll-laering',
      icon: AcademicCapIcon,
      description: 'Interaktiv sikkerhetskontroll læring'
    },
    {
      id: 'sikkerhetskontroll',
      label: 'Sikkerhetskontroll',
      href: '/sikkerhetskontroll',
      icon: ShieldCheckIcon,
      description: 'Sikkerhetssjekker og avvik'
    },
    {
      id: 'elever',
      label: 'Elever',
      href: '/elever',
      icon: UserGroupIcon,
      description: 'Elevadministrasjon'
    },
    {
      id: 'rapportering',
      label: 'Rapportering',
      href: '/rapportering',
      icon: ChartBarIcon,
      description: 'Rapporter og statistikk'
    },
    {
      id: 'okonomi',
      label: 'Økonomi',
      href: '/okonomi',
      icon: CurrencyDollarIcon,
      description: 'Økonomi og fakturering'
    },
    {
      id: 'hr',
      label: 'HR',
      href: '/hr',
      icon: BriefcaseIcon,
      description: 'Personaladministrasjon'
    },
    {
      id: 'prosjekt',
      label: 'Prosjekt',
      href: '/prosjekt',
      icon: ClipboardDocumentListIcon,
      description: 'Prosjektstyring'
    },
    {
      id: 'ressursplanlegging',
      label: 'Ressursplanlegging',
      href: '/ressursplanlegging',
      icon: TruckIcon,
      description: 'Kjøretøy og ressurser'
    },
    {
      id: 'oppgaver',
      label: 'Oppgaver',
      href: '/oppgaver',
      icon: ClipboardDocumentListIcon,
      description: 'Oppgaveadministrasjon'
    },
    {
      id: 'kalender',
      label: 'Kalender',
      href: '/kalender',
      icon: CalendarDaysIcon,
      description: 'Kalender og avtaler'
    },
    {
      id: 'nyheter',
      label: 'Nyheter',
      href: '/nyheter',
      icon: NewspaperIcon,
      description: 'Nyheter og kunngjøringer'
    },
    {
      id: 'hjelp',
      label: 'Hjelp',
      href: '/hjelp',
      icon: QuestionMarkCircleIcon,
      description: 'Hjelp og support'
    },
    {
      id: 'brukere',
      label: 'Brukere',
      href: '/brukere',
      icon: UsersIcon,
      description: 'Brukeradministrasjon',
      adminOnly: true
    },
    {
      id: 'innstillinger',
      label: 'Innstillinger',
      href: '/innstillinger',
      icon: Cog6ToothIcon,
      description: 'Systeminnstillinger',
      adminOnly: true
    }
  ];

  const isCurrentPage = (href: string) => location.pathname === href;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile menu */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              actualTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <span className="text-white font-bold text-sm">TMS</span>
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                actualTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                TMS System
              </h2>
              <p className={`text-xs ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Trafikkskole Management
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              actualTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-1">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPage(item.href);
              
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    current
                      ? actualTheme === 'dark'
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : actualTheme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    current
                      ? actualTheme === 'dark'
                        ? 'text-blue-200'
                        : 'text-blue-600'
                      : actualTheme === 'dark'
                        ? 'text-gray-400 group-hover:text-gray-200'
                        : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className={`text-xs mt-0.5 ${
                        current
                          ? actualTheme === 'dark'
                            ? 'text-blue-200'
                            : 'text-blue-600'
                          : actualTheme === 'dark'
                            ? 'text-gray-500'
                            : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  
                  {item.adminOnly && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      actualTheme === 'dark'
                        ? 'bg-purple-800 text-purple-200'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${
          actualTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`text-xs text-center ${
            actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <div>TMS v2.0.0</div>
            <div className="mt-1">© 2025 Trafikkskole Management</div>
          </div>
        </div>
      </div>
    </>
  );
};

// Mobile menu toggle button
export const MobileMenuButton: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ isOpen, onToggle, className = '' }) => {
  const { actualTheme } = useTheme();

  return (
    <button
      onClick={onToggle}
      className={`lg:hidden p-2 rounded-md transition-colors ${
        actualTheme === 'dark'
          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${className}`}
      aria-label={isOpen ? 'Lukk meny' : 'Åpne meny'}
    >
      {isOpen ? (
        <XMarkIcon className="h-6 w-6" />
      ) : (
        <Bars3Icon className="h-6 w-6" />
      )}
    </button>
  );
};

// Hook for mobile navigation state
export const useMobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close
  };
};

export default MobileNavigation; 
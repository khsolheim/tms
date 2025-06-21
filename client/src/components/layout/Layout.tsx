import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  BriefcaseIcon,
  CalendarIcon,
  CogIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Accessibility Components
import { Navigation, PageHeading, VisuallyHidden } from '../ui/AccessibilityComponents';
import { LanguageSelectorButton } from '../ui/LanguageSelector';
import { PWAInstallButton } from '../pwa/PWAInstallPrompt';
import { OnlineStatusIndicator } from '../pwa/PWAStatus';
import { useArrowNavigation, useEscapeKey } from '../../hooks/useA11y';

import { useTranslation } from '../../contexts/I18nContext';
import Breadcrumbs from '../ui/Breadcrumbs';
// Removed unused LiveRegion import

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  descriptionKey: string;
  name: string;
  description: string;
}

// Define navigation structure (will be translated in component)
const navigationStructure = [
  { 
    key: 'navigation.overview', 
    href: '/oversikt', 
    icon: HomeIcon,
    descriptionKey: 'navigation.overview.description'
  },
  { 
    key: 'navigation.companies', 
    href: '/bedrifter', 
    icon: BuildingOfficeIcon,
    descriptionKey: 'navigation.companies.description'
  },
  { 
    key: 'navigation.contracts', 
    href: '/kontrakter', 
    icon: DocumentTextIcon,
    descriptionKey: 'navigation.contracts.description'
  },
  { 
    key: 'navigation.tasks', 
    href: '/oppgaver', 
    icon: ClipboardDocumentListIcon,
    descriptionKey: 'navigation.tasks.description'
  },
  { 
    key: 'navigation.reporting', 
    href: '/rapportering', 
    icon: ChartBarIcon,
    descriptionKey: 'navigation.reporting.description'
  },
  { 
    key: 'navigation.finance', 
    href: '/okonomi', 
    icon: CurrencyDollarIcon,
    descriptionKey: 'navigation.finance.description'
  },
  { 
    key: 'navigation.hr', 
    href: '/hr', 
    icon: UsersIcon,
    descriptionKey: 'navigation.hr.description'
  },
  { 
    key: 'navigation.project', 
    href: '/prosjekt', 
    icon: BriefcaseIcon,
    descriptionKey: 'navigation.project.description'
  },
  { 
    key: 'navigation.resources', 
    href: '/ressursplanlegging', 
    icon: CalendarIcon,
    descriptionKey: 'navigation.resources.description'
  },
  { 
    key: 'navigation.quiz', 
    href: '/quiz', 
    icon: AcademicCapIcon,
    descriptionKey: 'navigation.quiz.description'
  },
  { 
    key: 'navigation.security', 
    href: '/sikkerhetskontroll', 
    icon: ShieldCheckIcon,
    descriptionKey: 'navigation.security.description'
  },
  { 
    key: 'navigation.settings', 
    href: '/innstillinger', 
    icon: CogIcon,
    descriptionKey: 'navigation.settings.description'
  },
  { 
    key: 'navigation.help', 
    href: '/hjelp', 
    icon: QuestionMarkCircleIcon,
    descriptionKey: 'navigation.help.description'
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  // Removed unused variables: announceMessage, setAnnounceMessage, announce, isKeyboardUser

  // Create navigation with translations
  const navigation: NavItem[] = navigationStructure.map(item => ({
    ...item,
    name: t(item.key),
    description: t(item.descriptionKey)
  }));

  // Accessibility: Arrow key navigation for sidebar
  const sidebarRef = useArrowNavigation<HTMLElement>('vertical', true);
  
  // Accessibility: Escape key to close sidebar
  useEscapeKey(() => setSidebarOpen(false), sidebarOpen);

  const getCurrentPageTitle = () => {
    const currentNavItem = navigation.find(item => 
      location.pathname === item.href || 
      (item.href !== '/oversikt' && location.pathname.startsWith(item.href))
    );
    return currentNavItem?.name || 'TMS';
  };

  const isActivePath = (href: string) => {
    if (href === '/oversikt') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-full">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-900/80" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button 
                type="button" 
                className="-m-2.5 p-2.5" 
                onClick={() => setSidebarOpen(false)}
                aria-label="Lukk sidebar"
              >
                <VisuallyHidden>Lukk sidebar</VisuallyHidden>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-2 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <PageHeading level={1} className="text-xl font-bold text-gray-900">
                  TMS
                </PageHeading>
              </div>
              
              <Navigation 
                ref={sidebarRef}
                label="Hovednavigasjon (mobil)"
                className="flex flex-1 flex-col"
              >
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActivePath(item.href)
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                            }`}
                            aria-describedby={`${item.name.toLowerCase()}-desc`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActivePath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                            <VisuallyHidden id={`${item.name.toLowerCase()}-desc`}>
                              {item.description}
                            </VisuallyHidden>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </Navigation>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-2">
          <div className="flex h-16 shrink-0 items-center">
            <PageHeading level={1} className="text-xl font-bold text-gray-900">
              TMS
            </PageHeading>
          </div>
          
          <Navigation 
            ref={sidebarRef}
            label="Hovednavigasjon"
            className="flex flex-1 flex-col"
          >
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          isActivePath(item.href)
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                        aria-describedby={`${item.name.toLowerCase()}-desc-desktop`}
                        aria-current={isActivePath(item.href) ? 'page' : undefined}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActivePath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                        <VisuallyHidden id={`${item.name.toLowerCase()}-desc-desktop`}>
                          {item.description}
                        </VisuallyHidden>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </Navigation>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-2">
          <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-2 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Åpne sidebar"
            >
              <VisuallyHidden>Åpne sidebar</VisuallyHidden>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <PageHeading level={2} className="text-lg font-semibold text-gray-900">
                  {getCurrentPageTitle()}
                  <VisuallyHidden> - TMS Training Management System</VisuallyHidden>
                </PageHeading>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <OnlineStatusIndicator />
                <PWAInstallButton />
                <LanguageSelectorButton />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs className="text-sm" />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
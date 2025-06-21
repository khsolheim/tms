import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ChevronRightIcon,
  HomeIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  maxItems?: number;
  showHome?: boolean;
  customItems?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  maxItems = 4,
  showHome = true,
  customItems,
  className = ''
}) => {
  const location = useLocation();
  const { actualTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Route to label mapping - kan utvides med mer spesifikke mapper
  const routeLabels: Record<string, string> = {
    '': 'Hjem',
    'oversikt': 'Oversikt',
    'bedrifter': 'Bedrifter',
    'kontrakter': 'Kontrakter',
    'quiz': 'Quiz',
    'sikkerhetskontroll': 'Sikkerhetskontroll',
    'innstillinger': 'Innstillinger',
    'brukere': 'Brukere',
    'elever': 'Elever',
    'rapportering': 'Rapportering',
    'okonomi': 'Økonomi',
    'hr': 'HR',
    'prosjekt': 'Prosjekt',
    'ressursplanlegging': 'Ressursplanlegging',
    'nyheter': 'Nyheter',
    'kalender': 'Kalender',
    'hjelp': 'Hjelp',
    'oppgaver': 'Oppgaver',
    'statistikk': 'Statistikk',
    'elevresultater': 'Elevresultater',
    'eksport': 'Eksport',
    'rapporter': 'Rapporter',
    'avtegning': 'Avtegning',
    'arkiv': 'Arkiv',
    'system': 'System',
    'sikkerhet': 'Sikkerhet',
    'integrasjoner': 'Integrasjoner',
    'tjenester': 'Tjenester',
    'admin': 'Admin',
    'analytics': 'Analytics',
    'performance': 'Performance',
    'database': 'Database',
    'sidebar': 'Sidebar',
    'epost': 'E-post',
    'sms': 'SMS',
    'api': 'API',
    'logger': 'Logger',
    'audit': 'Audit',
    'vpn': 'VPN',
    'firewall': 'Brannmur',
    'pdf': 'PDF',
    'qr': 'QR-koder',
    'ai': 'AI',
    'notifikasjon': 'Notifikasjoner'
  };

  // Generate breadcrumb items from current path or use custom items
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Hjem',
        href: '/',
        icon: HomeIcon
      });
    }

    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        href
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle collapsing items if there are too many
  const shouldCollapse = breadcrumbs.length > maxItems;
  const visibleItems = shouldCollapse 
    ? [
        breadcrumbs[0], // First item (usually Home)
        ...breadcrumbs.slice(-2) // Last 2 items
      ]
    : breadcrumbs;

  const hiddenItems = shouldCollapse 
    ? breadcrumbs.slice(1, -2) // Middle items
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isCurrentPage = item.href === location.pathname;
    const Icon = item.icon;

    return (
      <li key={`${item.href}-${index}`} className="flex items-center">
        {index > 0 && (
          <ChevronRightIcon className={`h-4 w-4 mx-2 ${
            actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
        )}
        
        {isCurrentPage ? (
          <span className={`flex items-center space-x-1 text-sm font-medium ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`} aria-current="page">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </span>
        ) : (
          <Link
            to={item.href}
            className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:underline ${
              actualTheme === 'dark' 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </Link>
        )}
      </li>
    );
  };

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex ${className}`}>
      <ol className="flex items-center space-x-0">
        {shouldCollapse ? (
          <>
            {/* First item */}
            {renderBreadcrumbItem(visibleItems[0], 0, false)}
            
            {/* Collapsed items dropdown */}
            <li className="flex items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium rounded transition-colors ${
                    actualTheme === 'dark'
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={`Vis ${hiddenItems.length} skjulte breadcrumbs`}
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                  <ChevronDownIcon className={`h-3 w-3 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showDropdown && hiddenItems.length > 0 && (
                  <div className={`absolute top-full left-0 mt-1 min-w-48 rounded-md shadow-lg z-50 border ${
                    actualTheme === 'dark'
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-1">
                      {hiddenItems.map((item, index) => (
                        <Link
                          key={`hidden-${item.href}-${index}`}
                          to={item.href}
                          className={`block px-3 py-2 text-sm transition-colors ${
                            actualTheme === 'dark'
                              ? 'text-gray-200 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setShowDropdown(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
            
            {/* Last items */}
            {visibleItems.slice(1).map((item, index) => 
              renderBreadcrumbItem(item, index + 1, index === visibleItems.length - 2)
            )}
          </>
        ) : (
          /* Show all items when not collapsed */
          visibleItems.map((item, index) => 
            renderBreadcrumbItem(item, index, index === visibleItems.length - 1)
          )
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
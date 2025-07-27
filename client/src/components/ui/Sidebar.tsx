import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CalendarDaysIcon,
  SpeakerWaveIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MegaphoneIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  CurrencyDollarIcon as CurrencyDollarSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  ClipboardDocumentListIcon as ClipboardDocumentListSolidIcon,
  TruckIcon as TruckSolidIcon,
  CalendarDaysIcon as CalendarDaysSolidIcon,
  SpeakerWaveIcon as SpeakerWaveSolidIcon,
  QuestionMarkCircleIcon as QuestionMarkCircleSolidIcon,
  MegaphoneIcon as MegaphoneSolidIcon,
  GiftIcon as GiftSolidIcon
} from '@heroicons/react/24/solid';
import RoleBased from '../auth/RoleBased';

interface MenuItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: number;
}

const MenuItem = ({ to, icon: Icon, activeIcon: ActiveIcon, children, badge }: MenuItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between gap-2 px-2 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-2">
          {ActiveIcon && isActive ? (
            <ActiveIcon className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
          <span>{children}</span>
        </div>
        {badge && badge > 0 && (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            isActive 
              ? 'bg-white text-blue-600' 
              : 'bg-blue-600 text-white'
          }`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const MenuGroup = ({ title, children, defaultOpen = true }: MenuGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        {isOpen ? (
          <ChevronDownIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
        {title}
      </button>
      {isOpen && (
        <div className="ml-1.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  return (
    <div className="px-2 py-1 h-full bg-white">
      <nav className="space-y-0.5">
        {/* Dashboard & Oversikt */}
        <MenuGroup title="Dashboard & Oversikt" defaultOpen={true}>
          <MenuItem 
            to="/oversikt" 
            icon={HomeIcon} 
            activeIcon={HomeSolidIcon}
          >
            Oversikt
          </MenuItem>

          <MenuItem 
            to="/dashboard/avansert" 
            icon={ChartBarIcon} 
            activeIcon={ChartBarSolidIcon}
          >
            Avansert Dashboard
          </MenuItem>

          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/oppgaver" 
              icon={ClipboardDocumentListIcon} 
              activeIcon={ClipboardDocumentListSolidIcon}
              badge={5}
            >
              Oppgaver
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/kalender" 
              icon={CalendarDaysIcon} 
              activeIcon={CalendarDaysSolidIcon}
            >
              Kalender
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* Annonsør & Sponsor System */}
        <MenuGroup title="Annonsør & Sponsor" defaultOpen={true}>
          <RoleBased roles={['ELEV']}>
            <MenuItem 
              to="/fordeler" 
              icon={GiftIcon} 
              activeIcon={GiftSolidIcon}
            >
              Elevfordeler
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/admin/annonsor" 
              icon={MegaphoneIcon} 
              activeIcon={MegaphoneSolidIcon}
            >
              Annonsør Admin
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/admin/annonsor/sponsorer" 
              icon={BuildingOfficeIcon}
            >
              Sponsorer
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/admin/annonsor/annonser" 
              icon={DocumentTextIcon}
            >
              Annonser
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/admin/annonsor/statistikk" 
              icon={ChartBarIcon}
            >
              Statistikk
            </RoleBased>
        </MenuGroup>

        {/* Business Moduler */}
        <MenuGroup title="Business Moduler" defaultOpen={true}>
          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/bedrifter" 
              icon={BuildingOfficeIcon}
            >
              Bedriftshåndtering
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/hr" 
              icon={UserGroupIcon} 
              activeIcon={UserGroupSolidIcon}
            >
              HR
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/okonomi" 
              icon={CurrencyDollarIcon} 
              activeIcon={CurrencyDollarSolidIcon}
            >
              Økonomi
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/kontrakter" 
              icon={DocumentTextIcon}
            >
              Kontrakter
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* Operasjoner */}
        <MenuGroup title="Operasjoner" defaultOpen={true}>
          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/ressursplanlegging" 
              icon={TruckIcon} 
              activeIcon={TruckSolidIcon}
            >
              Ressursplanlegging
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/prosjekt" 
              icon={ClipboardDocumentListIcon}
            >
              Prosjekt
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/sikkerhetskontroll" 
              icon={ShieldCheckIcon}
            >
              Sikkerhetskontroll
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* Utdanning */}
        <MenuGroup title="Utdanning" defaultOpen={true}>
          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/quiz" 
              icon={BookOpenIcon}
            >
              Quiz
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['ELEV', 'HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/sikkerhetskontroll-laering" 
              icon={AcademicCapIcon}
            >
              Sikkerhetskontroll Læring
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/elever" 
              icon={AcademicCapIcon}
            >
              Elever
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* Rapporter & Analyse */}
        <MenuGroup title="Rapporter & Analyse" defaultOpen={true}>
          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/rapportering" 
              icon={ChartBarIcon} 
              activeIcon={ChartBarSolidIcon}
            >
              Rapportering
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* Kommunikasjon */}
        <MenuGroup title="Kommunikasjon" defaultOpen={false}>
          <RoleBased roles={['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']}>
            <MenuItem 
              to="/nyheter" 
              icon={SpeakerWaveIcon} 
              activeIcon={SpeakerWaveSolidIcon}
              badge={3}
            >
              Nyheter
            </MenuItem>
          </RoleBased>
        </MenuGroup>

        {/* System */}
        <MenuGroup title="System" defaultOpen={false}>
          <RoleBased roles={['HOVEDBRUKER', 'ADMIN']}>
            <MenuItem 
              to="/innstillinger" 
              icon={Cog6ToothIcon}
            >
              Innstillinger
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['ADMIN']}>
            <MenuItem 
              to="/admin" 
              icon={Cog6ToothIcon}
            >
              Admin Portal
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['ADMIN']}>
            <MenuItem 
              to="/admin/page-access" 
              icon={Cog6ToothIcon}
            >
              Side-tilgang
            </MenuItem>
          </RoleBased>

          <RoleBased roles={['ADMIN']}>
            <MenuItem 
              to="/brukere" 
              icon={UsersIcon}
            >
              Brukere
            </MenuItem>
          </RoleBased>

          <MenuItem 
            to="/hjelp" 
            icon={QuestionMarkCircleIcon} 
            activeIcon={QuestionMarkCircleSolidIcon}
          >
            Hjelp
          </MenuItem>
        </MenuGroup>
      </nav>
    </div>
  );
} 
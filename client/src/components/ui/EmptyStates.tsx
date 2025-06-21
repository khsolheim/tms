/**
 * Empty States Components
 * 
 * Omfattende collection av empty states for bedre brukeropplevelse
 * når det ikke er data å vise
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../design-system/components/Button';

// ============================================================================
// TYPES
// ============================================================================

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface IllustrationProps {
  className?: string;
}

// ============================================================================
// ICONS & ILLUSTRATIONS
// ============================================================================

const NoDataIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SearchIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const AddIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const FolderIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const InboxIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const CloudIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
    />
  </svg>
);

const UserIcon: React.FC<IllustrationProps> = ({ className }) => (
  <svg
    className={cn('text-gray-400', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// ============================================================================
// BASE EMPTY STATE COMPONENT
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  image,
  primaryAction,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12 mb-4',
      title: 'text-lg font-semibold',
      description: 'text-sm',
      spacing: 'space-y-8',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16 mb-6',
      title: 'text-xl font-semibold',
      description: 'text-base',
      spacing: 'cards-spacing-vertical',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20 mb-8',
      title: 'text-2xl font-semibold',
      description: 'text-lg',
      spacing: 'cards-spacing-vertical',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('text-center', classes.container, className)}>
      <div className={classes.spacing}>
        {/* Icon eller Image */}
        {image ? (
          <img
            src={image}
            alt={title}
            className={cn('mx-auto', classes.icon, 'object-contain')}
          />
        ) : icon ? (
          <div className={cn('mx-auto', classes.icon)}>{icon}</div>
        ) : (
          <NoDataIcon className={cn('mx-auto', classes.icon)} />
        )}

        {/* Content */}
        <div>
          <h3 className={cn('text-gray-900 mb-2', classes.title)}>{title}</h3>
          <p className={cn('text-gray-600 max-w-sm mx-auto', classes.description)}>
            {description}
          </p>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row cards-spacing-grid justify-center">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || 'primary'}
                size={size}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size={size}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SPECIALIZED EMPTY STATES
// ============================================================================

interface SpecializedEmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NoDataEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  onAction,
  actionLabel = 'Last inn data',
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen data tilgjengelig"
    description="Det ser ut til at det ikke er noen data å vise her ennå."
    icon={<NoDataIcon />}
    primaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoSearchResultsEmptyState: React.FC<SpecializedEmptyStateProps & {
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onAction, onClearSearch, actionLabel = 'Prøv igjen', className, size = 'md' }) => (
  <EmptyState
    title="Ingen resultater funnet"
    description={
      searchTerm
        ? `Vi fant ingen resultater for "${searchTerm}". Prøv å justere søket ditt.`
        : 'Søket ditt ga ingen resultater. Prøv andre søkeord.'
    }
    icon={<SearchIcon />}
    primaryAction={
      onClearSearch
        ? {
            label: 'Tilbakestill søk',
            onClick: onClearSearch,
            variant: 'outline' as const,
          }
        : undefined
    }
    secondaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoContractsEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  onAction,
  actionLabel = 'Opprett kontrakt',
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen kontrakter ennå"
    description="Du har ikke opprettet noen kontrakter ennå. Kom i gang ved å opprette din første kontrakt."
    icon={<FolderIcon />}
    primaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoStudentsEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  onAction,
  actionLabel = 'Legg til elev',
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen elever registrert"
    description="Du har ikke lagt til noen elever ennå. Legg til din første elev for å komme i gang."
    icon={<UserIcon />}
    primaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoCompaniesEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  onAction,
  actionLabel = 'Legg til bedrift',
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen bedrifter registrert"
    description="Du har ikke lagt til noen bedrifter ennå. Legg til din første bedrift for å komme i gang."
    icon={<FolderIcon />}
    primaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoNotificationsEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen varsler"
    description="Du har ingen nye varsler. Vi vil varsle deg når det skjer noe viktig."
    icon={<InboxIcon />}
    className={className}
    size={size}
  />
);

export const NoReportsEmptyState: React.FC<SpecializedEmptyStateProps> = ({
  onAction,
  actionLabel = 'Opprett rapport',
  className,
  size = 'md',
}) => (
  <EmptyState
    title="Ingen rapporter generert"
    description="Du har ikke generert noen rapporter ennå. Opprett din første rapport for å få innsikt i dataene dine."
    icon={<NoDataIcon />}
    primaryAction={
      onAction
        ? {
            label: actionLabel,
            onClick: onAction,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

export const NoFilesEmptyState: React.FC<SpecializedEmptyStateProps & {
  onUpload?: () => void;
}> = ({ onAction, onUpload, actionLabel = 'Last opp fil', className, size = 'md' }) => (
  <EmptyState
    title="Ingen filer lastet opp"
    description="Du har ikke lastet opp noen filer ennå. Last opp din første fil for å komme i gang."
    icon={<CloudIcon />}
    primaryAction={
      onUpload
        ? {
            label: actionLabel,
            onClick: onUpload,
          }
        : undefined
    }
    secondaryAction={
      onAction
        ? {
            label: 'Opprett ny',
            onClick: onAction,
            variant: 'outline' as const,
          }
        : undefined
    }
    className={className}
    size={size}
  />
);

// ============================================================================
// CARD-BASED EMPTY STATES
// ============================================================================

export const CardEmptyState: React.FC<EmptyStateProps> = ({ className, ...props }) => (
  <div className={cn('bg-white rounded-lg border shadow-sm', className)}>
    <EmptyState {...props} />
  </div>
);

export const TableEmptyState: React.FC<{
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  columns: number;
  className?: string;
}> = ({
  title = 'Ingen data å vise',
  description = 'Det er ingen data tilgjengelig for øyeblikket.',
  onAction,
  actionLabel = 'Legg til data',
  columns,
  className,
}) => (
  <tr className={className}>
    <td colSpan={columns} className="px-2 py-1">
      <EmptyState
        title={title}
        description={description}
        primaryAction={
          onAction
            ? {
                label: actionLabel,
                onClick: onAction,
              }
            : undefined
        }
        size="sm"
      />
    </td>
  </tr>
);

// ============================================================================
// LOADING EMPTY STATES
// ============================================================================

export const LoadingEmptyState: React.FC<{
  title?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  title = 'Laster inn data...',
  description = 'Vennligst vent mens vi henter dataene dine.',
  className,
  size = 'md',
}) => {
  const LoadingIcon: React.FC<IllustrationProps> = ({ className: iconClassName }) => (
    <div className={cn('animate-spin', iconClassName)}>
      <svg
        className="text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </div>
  );

  return (
    <EmptyState
      title={title}
      description={description}
      icon={<LoadingIcon />}
      className={className}
      size={size}
    />
  );
};

// ============================================================================
// ERROR EMPTY STATES
// ============================================================================

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  title = 'Noe gikk galt',
  description = 'Vi kunne ikke laste inn dataene. Prøv igjen senere.',
  onRetry,
  onGoBack,
  className,
  size = 'md',
}) => {
  const ErrorIcon: React.FC<IllustrationProps> = ({ className: iconClassName }) => (
    <svg
      className={cn('text-red-400', iconClassName)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <EmptyState
      title={title}
      description={description}
      icon={<ErrorIcon />}
      primaryAction={
        onRetry
          ? {
              label: 'Prøv igjen',
              onClick: onRetry,
            }
          : undefined
      }
      secondaryAction={
        onGoBack
          ? {
              label: 'Gå tilbake',
              onClick: onGoBack,
              variant: 'outline' as const,
            }
          : undefined
      }
      className={className}
      size={size}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Icons
  NoDataIcon,
  SearchIcon,
  AddIcon,
  FolderIcon,
  InboxIcon,
  CloudIcon,
  UserIcon,
}; 
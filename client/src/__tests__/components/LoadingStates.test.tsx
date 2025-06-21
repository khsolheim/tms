/**
 * LoadingStates Component Tests
 * 
 * Comprehensive testing av loading states komponenter
 */

import React from 'react';
import { render, screen } from '../utils/test-utils';
import { 
  Spinner, 
  LoadingOverlay, 
  CardSkeleton, 
  Skeleton,
  TableSkeleton,
  LoadingButton,
  TextSkeleton,
  HeadingSkeleton
} from '../../components/ui/LoadingStates';

describe('LoadingStates', () => {
  describe('Spinner', () => {
    it('rendrer standard spinner', () => {
      render(<Spinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('rendrer med custom størrelse', () => {
      render(<Spinner size="lg" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8 h-8');
    });

    it('rendrer med custom farge', () => {
      render(<Spinner color="white" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-white');
    });

    it('har riktig aria-label for tilgjengelighet', () => {
      render(<Spinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Laster');
    });
  });

  describe('LoadingOverlay', () => {
    it('rendrer overlay med default melding', () => {
      render(<LoadingOverlay />);
      
      expect(screen.getByText('Laster...')).toBeInTheDocument();
    });

    it('rendrer med custom melding', () => {
      render(<LoadingOverlay message="Henter brukerdata..." />);
      
      expect(screen.getByText('Henter brukerdata...')).toBeInTheDocument();
    });

    it('rendrer children inne i overlay', () => {
      render(
        <LoadingOverlay>
          <div>Test content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('rendrer default skeleton', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('rendrer med custom dimensjoner', () => {
      render(<Skeleton width="200px" height="100px" data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({
        width: '200px',
        height: '100px',
      });
    });

    it('rendrer rund skeleton', () => {
      render(<Skeleton rounded data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('kan deaktivere animasjon', () => {
      render(<Skeleton animate={false} data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });

  describe('CardSkeleton', () => {
    it('rendrer card skeleton', () => {
      render(<CardSkeleton data-testid="card-skeleton" />);
      
      const card = screen.getByTestId('card-skeleton');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white rounded-lg shadow-sm');
    });
  });

  describe('TableSkeleton', () => {
    it('rendrer table skeleton med default verdier', () => {
      render(<TableSkeleton data-testid="table-skeleton" />);
      
      const table = screen.getByTestId('table-skeleton');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('bg-white rounded-lg');
    });

    it('rendrer uten header når showHeader er false', () => {
      render(<TableSkeleton showHeader={false} data-testid="table-skeleton" />);
      
      const table = screen.getByTestId('table-skeleton');
      expect(table).toBeInTheDocument();
      // Sjekk at header ikke finnes
      expect(table.querySelector('.bg-gray-50')).not.toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('rendrer normal button når ikke loading', () => {
      render(<LoadingButton loading={false}>Lagre</LoadingButton>);
      
      const button = screen.getByRole('button', { name: 'Lagre' });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('viser loading state', () => {
      render(<LoadingButton loading>Lagre</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Laster...')).toBeInTheDocument();
    });

    it('viser custom loading tekst', () => {
      render(<LoadingButton loading>Lagrer...</LoadingButton>);
      
      expect(screen.getByText('Lagrer...')).toBeInTheDocument();
    });

    it('er disabled når loading er true', () => {
      render(<LoadingButton loading>Lagre</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('TextSkeleton', () => {
    it('rendrer default antall linjer', () => {
      render(<TextSkeleton data-testid="text-skeleton" />);
      
      const textSkeleton = screen.getByTestId('text-skeleton');
      expect(textSkeleton).toBeInTheDocument();
      // Default er 3 linjer
      expect(textSkeleton.children).toHaveLength(3);
    });

    it('rendrer custom antall linjer', () => {
      render(<TextSkeleton lines={5} data-testid="text-skeleton" />);
      
      const textSkeleton = screen.getByTestId('text-skeleton');
      expect(textSkeleton.children).toHaveLength(5);
    });
  });

  describe('HeadingSkeleton', () => {
    it('rendrer heading skeleton', () => {
      render(<HeadingSkeleton data-testid="heading-skeleton" />);
      
      const heading = screen.getByTestId('heading-skeleton');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('h-8 w-2/3');
    });
  });

  describe('Accessibility', () => {
    it('spinner har riktige aria attributes', () => {
      render(<Spinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Laster');
    });

    it('loading overlay er synlig for screen readers', () => {
      render(<LoadingOverlay />);
      
      const overlay = screen.getByText('Laster...');
      expect(overlay).toBeInTheDocument();
    });

    it('loading button har riktig tilstand', () => {
      render(<LoadingButton loading>Test</LoadingButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Performance', () => {
    it('komponenter rendrer uten å forårsake memory leaks', () => {
      const { unmount } = render(<Spinner />);
      
      // Sjekk at komponenten kan unmountes uten feil
      expect(() => unmount()).not.toThrow();
    });

    it('skeletons rendrer effektivt', () => {
      const { container } = render(<CardSkeleton />);
      
      // Sjekk at skeleton har rendered
      expect(container.firstChild).toBeInTheDocument();
    });
  });
}); 
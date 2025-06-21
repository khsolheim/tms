/**
 * Integration Test: Login and Contract Creation Flow
 * 
 * Tester den kritiske bruker-flowet fra pålogging til kontraktopprettelse
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import App from '../../App';
import { AuthProvider } from '../../contexts/AuthContext';
import { mockUser, mockBedrift, mockKontrakt } from '../mocks/mockData';

// Mock API responses
const server = setupServer(
  // Login endpoint
  rest.post('/api/auth/logg-inn', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          bruker: mockUser,
          bedrift: mockBedrift
        }
      })
    );
  }),

  // User details endpoint
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          bruker: mockUser,
          bedrift: mockBedrift
        }
      })
    );
  }),

  // Create contract endpoint
  rest.post('/api/kontrakter', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          ...mockKontrakt,
          id: Date.now()
        }
      })
    );
  }),

  // Get contracts list
  rest.get('/api/kontrakter', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [mockKontrakt]
      })
    );
  })
);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

describe('Integration: Login and Contract Creation Flow', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it('skal kunne logge inn og opprette en kontrakt', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // ===============================
    // STEG 1: Pålogging
    // ===============================
    
    // Sjekk at vi er på innloggingssiden
    expect(screen.getByRole('heading', { name: /logg inn/i })).toBeInTheDocument();
    
    // Fyll inn påloggingsskjema
    const emailInput = screen.getByLabelText(/e-post/i);
    const passwordInput = screen.getByLabelText(/passord/i);
    const loginButton = screen.getByRole('button', { name: /logg inn/i });

    await userEvent.type(emailInput, 'admin@testbedrift.no');
    await userEvent.type(passwordInput, 'admin123');
    await userEvent.click(loginButton);

    // Vent på at pålogging fullføres
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /logg inn/i })).not.toBeInTheDocument();
    });

    // Sjekk at vi er omdirigert til dashboard/oversikt
    await waitFor(() => {
      expect(screen.getByText(/oversikt/i)).toBeInTheDocument();
    });

    // ===============================
    // STEG 2: Navigasjon til kontrakter
    // ===============================
    
    // Finn og klikk på "Kontrakter" i navigasjonen
    const kontrakterNavLink = screen.getByRole('link', { name: /kontrakter/i });
    await userEvent.click(kontrakterNavLink);

    // Sjekk at vi er på kontrakt-oversiktssiden
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /kontrakter/i })).toBeInTheDocument();
    });

    // ===============================
    // STEG 3: Opprett ny kontrakt
    // ===============================
    
    // Klikk på "Opprett kontrakt" knapp
    const opprettKontraktButton = screen.getByRole('button', { name: /opprett.*kontrakt/i });
    await userEvent.click(opprettKontraktButton);

    // Sjekk at vi er på kontrakt opprettelse siden
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /opprett.*kontrakt/i })).toBeInTheDocument();
    });

    // ===============================
    // STEG 4: Fyll ut kontraktskjema
    // ===============================
    
    // Fyll inn elev informasjon
    await userEvent.type(screen.getByLabelText(/fornavn/i), 'Test');
    await userEvent.type(screen.getByLabelText(/etternavn/i), 'Testesen');
    await userEvent.type(screen.getByLabelText(/personnummer/i), '12345678901');
    await userEvent.type(screen.getByLabelText(/telefon/i), '12345678');
    await userEvent.type(screen.getByLabelText(/e-post/i), 'test@example.com');

    // Fyll inn adresse
    await userEvent.type(screen.getByLabelText(/adresse/i), 'Testveien 1');
    await userEvent.type(screen.getByLabelText(/postnummer/i), '0123');
    await userEvent.type(screen.getByLabelText(/poststed/i), 'Oslo');

    // Fyll inn lån informasjon
    await userEvent.type(screen.getByLabelText(/lånebeløp/i), '100000');
    await userEvent.type(screen.getByLabelText(/løpetid/i), '24');
    await userEvent.type(screen.getByLabelText(/rente/i), '5.5');

    // ===============================
    // STEG 5: Lagre kontrakt
    // ===============================
    
    const lagreButton = screen.getByRole('button', { name: /lagre/i });
    await userEvent.click(lagreButton);

    // Sjekk at kontrakt ble lagret
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/lagret/i));
    });

    // ===============================
    // STEG 6: Bekreft at kontrakt finnes i oversikten
    // ===============================
    
    // Gå tilbake til kontrakt oversikt
    const tilbakeTilOversiktButton = screen.getByRole('button', { name: /tilbake/i });
    await userEvent.click(tilbakeTilOversiktButton);

    // Sjekk at kontrakten vises i listen
    await waitFor(() => {
      expect(screen.getByText('Test Testesen')).toBeInTheDocument();
    });
    
    expect(screen.getByText('100 000 kr')).toBeInTheDocument();
  });

  it('skal håndtere påloggingsfeil korrekt', async () => {
    // Override login endpoint for å returnere feil
    server.use(
      rest.post('/api/auth/logg-inn', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            success: false,
            message: 'Ugyldig e-post eller passord'
          })
        );
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Fyll inn ugyldig påloggingsskjema
    const emailInput = screen.getByLabelText(/e-post/i);
    const passwordInput = screen.getByLabelText(/passord/i);
    const loginButton = screen.getByRole('button', { name: /logg inn/i });

    await userEvent.type(emailInput, 'ugyldig@example.com');
    await userEvent.type(passwordInput, 'feilpassord');
    await userEvent.click(loginButton);

    // Sjekk at feilmelding vises
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/ugyldig.*passord/i));
    });

    // Sjekk at vi fortsatt er på innloggingssiden
    expect(screen.getByRole('heading', { name: /logg inn/i })).toBeInTheDocument();
  });

  it('skal håndtere kontrakt opprettelse feil', async () => {
    // Override contract creation endpoint for å returnere feil
    server.use(
      rest.post('/api/kontrakter', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            message: 'Valideringsfeil: Ugyldig personnummer'
          })
        );
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Logg inn først (forkortet versjon)
    await userEvent.type(screen.getByLabelText(/e-post/i), 'admin@testbedrift.no');
    await userEvent.type(screen.getByLabelText(/passord/i), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /logg inn/i }));

    await waitFor(() => {
      expect(screen.getByText(/oversikt/i)).toBeInTheDocument();
    });

    // Gå til kontrakt opprettelse
    await userEvent.click(screen.getByRole('link', { name: /kontrakter/i }));
    await userEvent.click(screen.getByRole('button', { name: /opprett.*kontrakt/i }));

    // Fyll inn ugyldig data
    await userEvent.type(screen.getByLabelText(/personnummer/i), '123'); // Ugyldig personnummer
    await userEvent.type(screen.getByLabelText(/lånebeløp/i), '100000');

    // Forsøk å lagre
    await userEvent.click(screen.getByRole('button', { name: /lagre/i }));

    // Sjekk at feilmelding vises
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/valideringsfeil/i));
    });
  });

  it('skal støtte optimistic updates ved kontrakt opprettelse', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Logg inn og gå til kontrakter
    await userEvent.type(screen.getByLabelText(/e-post/i), 'admin@testbedrift.no');
    await userEvent.type(screen.getByLabelText(/passord/i), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /logg inn/i }));

    await waitFor(() => {
      expect(screen.getByText(/oversikt/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('link', { name: /kontrakter/i }));
    await userEvent.click(screen.getByRole('button', { name: /opprett.*kontrakt/i }));

    // Fyll ut og lagre kontrakt
    await userEvent.type(screen.getByLabelText(/fornavn/i), 'Optimistic');
    await userEvent.type(screen.getByLabelText(/etternavn/i), 'Update');
    await userEvent.type(screen.getByLabelText(/personnummer/i), '98765432109');
    await userEvent.type(screen.getByLabelText(/lånebeløp/i), '50000');

    await userEvent.click(screen.getByRole('button', { name: /lagre/i }));

    // Sjekk at optimistic update fungerer (kontrakten vises umiddelbart)
    expect(screen.getByText('Optimistic Update')).toBeInTheDocument();

    // Sjekk at suksess melding vises
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/lagret/i));
    });
  });
}); 
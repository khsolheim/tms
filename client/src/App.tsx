// Login fix applied - token refresh removed
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/ui';

import { AccessibilityProvider, AccessibilityToolbar, injectAccessibilityStyles } from './contexts/AccessibilityContext';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PWAStatusBar } from './components/pwa/PWAStatus';
import { SkipLinks } from './components/ui/KeyboardNavigation';
import { queryClient } from './lib/react-query';
import { AuthProvider, useAuth } from './contexts';
import { SkipNavigation, GlobalAnnouncements, MainContent } from './components/ui/AccessibilityComponents';
import { PageLoadingSpinner } from './components/ui/LoadingSpinner';
import { AdminWrapper } from './components/AdminWrapper';
// import PerformanceMonitor from './components/PerformanceMonitor'; // Temporarily disabled for build

// Lazy load alle sider for code splitting
const Oversikt = lazy(() => import('./pages/Oversikt/Index'));
const Oppgaver = lazy(() => import('./pages/Oppgaver/Index'));
const Kalender = lazy(() => import('./pages/Kalender/Index'));
const Nyheter = lazy(() => import('./pages/Nyheter/Index'));
const Quiz = lazy(() => import('./pages/Quiz/Index'));
const QuizOversikt = lazy(() => import('./pages/Quiz/QuizOversikt'));
const TaQuiz = lazy(() => import('./pages/Quiz/TaQuiz'));
const Sporsmalsbibliotek = lazy(() => import('./pages/Quiz/Sporsmalsbibliotek'));
const Kategorier = lazy(() => import('./pages/Quiz/Kategorier'));
const OpprettSporsmal = lazy(() => import('./pages/Quiz/OpprettSporsmal'));
const OpprettQuiz = lazy(() => import('./pages/Quiz/OpprettQuiz'));
const RedigerSporsmal = lazy(() => import('./pages/Quiz/RedigerSporsmal'));
const RedigerKategori = lazy(() => import('./pages/Quiz/RedigerKategori'));
const KundeOversikt = lazy(() => import('./pages/Kunde/KundeOversikt'));
const OpprettKunde = lazy(() => import('./pages/Kunde/OpprettKunde'));
const KundeDetaljer = lazy(() => import('./pages/Kunde/KundeDetaljer'));
const Bedrifter = lazy(() => import('./pages/Bedrifter'));
const Ansatte = lazy(() => import('./pages/Ansatte'));
const BedriftDetaljer = lazy(() => import('./pages/BedriftDetaljer'));
const AdminOversikt = lazy(() => import('./pages/Sikkerhetskontroll/Admin/AdminOversikt'));
const SjekkpunktBibliotek = lazy(() => import('./pages/Sikkerhetskontroll/Admin/SjekkpunktBibliotek'));
const OpprettSjekkpunkt = lazy(() => import('./pages/Sikkerhetskontroll/Admin/OpprettSjekkpunkt'));
const RedigerSjekkpunkt = lazy(() => import('./pages/Sikkerhetskontroll/Admin/RedigerSjekkpunkt'));
const OpprettKontroll = lazy(() => import('./pages/Sikkerhetskontroll/Admin/OpprettKontroll'));
const KontrollerOversikt = lazy(() => import('./pages/Sikkerhetskontroll/Admin/KontrollerOversikt'));
const ListeBibliotek = lazy(() => import('./pages/Sikkerhetskontroll/Admin/ListeBibliotek'));
const OpprettKontrollMal = lazy(() => import('./pages/Sikkerhetskontroll/Admin/OpprettKontrollMal'));
const BedriftWizard = lazy(() => import('./pages/Bedrifter/BedriftWizard'));
const BedriftRediger = lazy(() => import('./pages/Bedrifter/BedriftRediger'));
const Brukere = lazy(() => import('./pages/Brukere'));
const LoggInn = lazy(() => import('./pages/LoggInn'));
const Innstillinger = lazy(() => import('./pages/Innstillinger'));
const Rolletilganger = lazy(() => import('./pages/Innstillinger/Admin/Rolletilganger'));
const ReferanseData = lazy(() => import('./pages/Innstillinger/Admin/ReferanseData'));
const Systemkonfigurasjon = lazy(() => import('./pages/Innstillinger/Systemkonfigurasjon'));
const Kontrakter = lazy(() => import('./pages/Kontrakter'));
const AnsattRegistrer = lazy(() => import('./pages/AnsattRegistrer'));
const Elever = lazy(() => import('./pages/Elever'));
const AssetOptimizationDemo = lazy(() => import('./components/optimization/AssetOptimizationDemo'));
const EpostIntegrasjon = lazy(() => import('./pages/Innstillinger/Integrasjoner/EpostIntegrasjon'));

// Nye manglende sider  
const RapporteringIndex = lazy(() => import('./pages/Rapportering/Index'));
const BusinessIntelligence = lazy(() => import('./pages/Rapportering/BusinessIntelligence'));
const Finansiell = lazy(() => import('./pages/Rapportering/Finansiell'));
const Operasjonell = lazy(() => import('./pages/Rapportering/Operasjonell'));
const Kundeanalyse = lazy(() => import('./pages/Rapportering/Kundeanalyse'));
const PersonalAnalyse = lazy(() => import('./pages/Rapportering/PersonalAnalyse'));
const RapportEksport = lazy(() => import('./pages/Rapportering/Eksport'));
const OkonomiIndex = lazy(() => import('./pages/Okonomi/Index'));
const HRIndex = lazy(() => import('./pages/HR/Index'));
const ProsjektIndex = lazy(() => import('./pages/Prosjekt/Index'));
const RessursplanleggingIndex = lazy(() => import('./pages/Ressursplanlegging/Index'));
const AnalyticsAdmin = lazy(() => import('./pages/Innstillinger/System/AnalyticsAdmin'));
const PerformanceMonitoring = lazy(() => import('./pages/Innstillinger/System/PerformanceMonitoring'));
const AssetOptimization = lazy(() => import('./pages/Innstillinger/System/AssetOptimization'));
const DatabaseAdmin = lazy(() => import('./pages/Innstillinger/System/DatabaseAdmin'));
const SidebarAdmin = lazy(() => import('./pages/Innstillinger/System/SidebarAdmin'));

// Nye undersider
const BedriftKjøretøy = lazy(() => import('./pages/Bedrifter/BedriftKjøretøy'));
const BedriftFakturering = lazy(() => import('./pages/Bedrifter/BedriftFakturering'));
const BedriftHistorikk = lazy(() => import('./pages/Bedrifter/BedriftHistorikk'));
const BedriftElevStatistikk = lazy(() => import('./pages/Bedrifter/BedriftElevStatistikk'));
const ElevProfil = lazy(() => import('./pages/Elever/ElevProfil'));
const KontraktDetaljer = lazy(() => import('./pages/Kontrakter/KontraktDetaljer'));
const QuizStatistikk = lazy(() => import('./pages/Quiz/QuizStatistikk'));
const LoggOversikt = lazy(() => import('./pages/Innstillinger/Sikkerhet/LoggOversikt'));
const ApiAdmin = lazy(() => import('./pages/Innstillinger/Integrasjoner/ApiAdmin'));

// Nye manglende komponenter
const BedriftKontrakter = lazy(() => import('./components/modals/BedriftKontrakter'));
const BedriftDokumenter = lazy(() => import('./components/modals/BedriftDokumenter'));
const BedriftRapporter = lazy(() => import('./components/modals/BedriftRapporter'));
const ElevKontrakter = lazy(() => import('./components/modals/ElevKontrakter'));
const SikkerhetskontrollRapporter = lazy(() => import('./components/modals/SikkerhetskontrollRapporter'));

// Sikkerhetskontroll Læring-modulen
const SikkerhetskontrollLaering = lazy(() => import('./pages/Sikkerhetskontroll/Elev/SikkerhetskontrollLaering'));
const KlasseOversikt = lazy(() => import('./pages/Sikkerhetskontroll/Elev/KlasseOversikt'));
const KategoriLaering = lazy(() => import('./pages/Sikkerhetskontroll/Elev/KategoriLaering'));
const Achievements = lazy(() => import('./pages/Sikkerhetskontroll/Elev/Achievements'));
const KategoriTest = lazy(() => import('./pages/Sikkerhetskontroll/Elev/KategoriTest'));
const TestkandidatTest = lazy(() => import('./pages/Sikkerhetskontroll/Elev/TestkandidatTest'));
const MesterTest = lazy(() => import('./pages/Sikkerhetskontroll/Elev/MesterTest'));
const Leaderboard = lazy(() => import('./pages/Sikkerhetskontroll/Elev/Leaderboard'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminSecurity = lazy(() => import('./pages/Admin/Security/SecurityPage'));
const AdminServices = lazy(() => import('./pages/Admin/Services/ServicesPage'));
const AdminBedrifter = lazy(() => import('./pages/Admin/Bedrifter/BedrifterPage'));
const AdminBrukere = lazy(() => import('./pages/Admin/Brukere/BrukerePage'));
const AdminSystem = lazy(() => import('./pages/Admin/System/SystemPage'));
const AdminMiddleware = lazy(() => import('./pages/Admin/Middleware/MiddlewarePage'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { erInnlogget, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingSpinner />;
  }
  
  if (!erInnlogget) {
    return <Navigate to="/logg-inn" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  // Inject accessibility styles on mount
  useEffect(() => {
    injectAccessibilityStyles();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AuthProvider>
            <Router>
            <SkipLinks />
            <AccessibilityToolbar />
            <SkipNavigation />
            <GlobalAnnouncements />
            <div className="App min-h-screen bg-gray-50">
              <PWAStatusBar className="fixed top-0 left-0 right-0 z-50" />
              <Layout>
                <MainContent>
                  <Suspense fallback={<PageLoadingSpinner />}>
                    <Routes>
                    <Route path="/" element={<Navigate to="/oversikt" />} />
                    <Route path="/logg-inn" element={<LoggInn />} />
                    <Route path="/oversikt" element={<Oversikt />} />
                    <Route path="/oppgaver" element={<Oppgaver />} />
                    <Route path="/kalender" element={<Kalender />} />
                    <Route path="/nyheter" element={<Nyheter />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/quiz/ta-quiz" element={<TaQuiz />} />
                    <Route path="/quiz/oversikt" element={<QuizOversikt />} />
                    <Route path="/quiz/oversikt/:tab" element={<QuizOversikt />} />
                    <Route path="/quiz/sporsmalsbibliotek" element={<Sporsmalsbibliotek />} />
                    <Route path="/quiz/kategorier" element={<Kategorier />} />
                    <Route path="/quiz/opprett-sporsmal" element={<OpprettSporsmal />} />
                    <Route path="/quiz/opprett-quiz" element={<OpprettQuiz />} />
                    <Route path="/quiz/sporsmal/:id" element={<RedigerSporsmal />} />
                    <Route path="/quiz/kategori/:id" element={<RedigerKategori />} />
                    <Route path="/kunde/oversikt" element={<KundeOversikt />} />
                    <Route path="/kunde/opprett" element={<OpprettKunde />} />
                    <Route path="/kunde/:id" element={<KundeDetaljer />} />
                    <Route path="/bedrifter" element={<Bedrifter />} />
                    <Route path="/ansatte" element={<Ansatte />} />
                    <Route path="/kontrakter" element={<Kontrakter />} />
                    <Route path="/bedrifter/:id" element={<BedriftDetaljer />} />
                    <Route path="/bedrifter/:id/:tab" element={<BedriftDetaljer />} />
                    <Route path="/bedrifter/:id/rediger" element={<BedriftRediger />} />
                    <Route path="/sikkerhetskontroll" element={<AdminOversikt />} />
                    <Route path="/sikkerhetskontroll/sjekkpunktbibliotek" element={<SjekkpunktBibliotek />} />
                    <Route path="/sikkerhetskontroll/opprett-sjekkpunkt" element={<OpprettSjekkpunkt />} />
                    <Route path="/sikkerhetskontroll/sjekkpunkt/:id" element={<RedigerSjekkpunkt />} />
                    <Route path="/sikkerhetskontroll/opprett-kontroll" element={<OpprettKontroll />} />
                    <Route path="/sikkerhetskontroll/kontroller" element={<KontrollerOversikt />} />
                    <Route path="/sikkerhetskontroll/liste-bibliotek" element={<ListeBibliotek />} />
                    <Route path="/sikkerhetskontroll/mal/opprett" element={<OpprettKontrollMal />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/admin/dashboard" element={<AdminWrapper><AdminDashboard /></AdminWrapper>} />
                    <Route path="/admin/security" element={<AdminWrapper><AdminSecurity /></AdminWrapper>} />
                    <Route path="/admin/services" element={<AdminWrapper><AdminServices /></AdminWrapper>} />
                    <Route path="/admin/bedrifter" element={<AdminWrapper><AdminBedrifter /></AdminWrapper>} />
                    <Route path="/admin/brukere" element={<AdminWrapper><AdminBrukere /></AdminWrapper>} />
                    <Route path="/admin/system" element={<AdminWrapper><AdminSystem /></AdminWrapper>} />
                    <Route path="/admin/middleware" element={<AdminWrapper><AdminMiddleware /></AdminWrapper>} />
                    
                    {/* Sikkerhetskontroll Læring-modulen */}
                    <Route path="/sikkerhetskontroll-laering" element={<SikkerhetskontrollLaering />} />
                    <Route path="/sikkerhetskontroll-laering/klasse/:klasseId" element={<KlasseOversikt />} />
                    <Route path="/sikkerhetskontroll-laering/kategori/:kategoriId" element={<KategoriLaering />} />
                    <Route path="/sikkerhetskontroll-laering/achievements" element={<Achievements />} />
                    <Route path="/sikkerhetskontroll-laering/kategori/:kategoriId/test" element={<KategoriTest />} />
                    <Route path="/sikkerhetskontroll-laering/kategori/:kategoriId/testkandidat" element={<TestkandidatTest />} />
                    <Route path="/sikkerhetskontroll-laering/kategori/:kategoriId/mester" element={<MesterTest />} />
                    <Route path="/sikkerhetskontroll-laering/leaderboard" element={<Leaderboard />} />
                    <Route path="/bedrifter/wizard" element={<BedriftWizard />} />
                    <Route path="/brukere" element={<Brukere />} />
                    <Route path="/elever" element={<Elever />} />
                    <Route path="/innstillinger" element={<Innstillinger />} />
                    <Route path="/innstillinger/admin/rolletilganger" element={<Rolletilganger />} />
                <Route path="/innstillinger/admin/referanse-data" element={<ReferanseData />} />
                    <Route path="/innstillinger/system" element={<Systemkonfigurasjon />} />
                    <Route path="/bedrifter/:bedriftId/ansatte/:ansattId/rediger" element={<AnsattRegistrer />} />
                    <Route path="/bedrifter/:bedriftId/ansatte/ny" element={<AnsattRegistrer />} />
                    <Route path="/demo/asset-optimization" element={<AssetOptimizationDemo />} />
                    <Route path="/innstillinger/integrasjoner/epost" element={<EpostIntegrasjon />} />
                    
                    {/* Nye hovedsider */}
                    <Route path="/rapportering" element={<RapporteringIndex />} />
                    <Route path="/rapportering/business-intelligence" element={<BusinessIntelligence />} />
                    <Route path="/rapportering/finansiell" element={<Finansiell />} />
                    <Route path="/rapportering/operasjonell" element={<Operasjonell />} />
                    <Route path="/rapportering/kundeanalyse" element={<Kundeanalyse />} />
                    <Route path="/rapportering/personalanalyse" element={<PersonalAnalyse />} />
                    <Route path="/rapportering/eksport" element={<RapportEksport />} />
                    <Route path="/okonomi" element={<OkonomiIndex />} />
                    <Route path="/hr" element={<HRIndex />} />
                    <Route path="/prosjekt" element={<ProsjektIndex />} />
                    <Route path="/ressursplanlegging" element={<RessursplanleggingIndex />} />
                    
                    {/* Service administration sider */}
                    <Route path="/innstillinger/system/analytics" element={<AnalyticsAdmin />} />
                    <Route path="/innstillinger/system/performance" element={<PerformanceMonitoring />} />
                    <Route path="/innstillinger/system/assets" element={<AssetOptimization />} />
                    <Route path="/innstillinger/system/database" element={<DatabaseAdmin />} />
                    <Route path="/innstillinger/system/sidebar" element={<SidebarAdmin />} />
                    
                    {/* Undersider */}
                    <Route path="/bedrifter/:bedriftId/kjøretøy" element={<BedriftKjøretøy />} />
                    <Route path="/bedrifter/:bedriftId/fakturering" element={<BedriftFakturering />} />
                    <Route path="/bedrifter/:bedriftId/historikk" element={<BedriftHistorikk />} />
                    <Route path="/bedrifter/:bedriftId/elever" element={<BedriftElevStatistikk />} />
                    <Route path="/elever/:elevId" element={<ElevProfil />} />
                    <Route path="/kontrakter/:kontraktId" element={<KontraktDetaljer />} />
                    <Route path="/quiz/statistikk" element={<QuizStatistikk />} />
                    <Route path="/innstillinger/sikkerhet/logger" element={<LoggOversikt />} />
                    <Route path="/innstillinger/integrasjoner/api" element={<ApiAdmin />} />
                    
                    {/* Nye manglende undersider */}
                    <Route path="/bedrifter/:bedriftId/kontrakter" element={<BedriftKontrakter />} />
                    <Route path="/bedrifter/:bedriftId/dokumenter" element={<BedriftDokumenter />} />
                    <Route path="/bedrifter/:bedriftId/rapporter" element={<BedriftRapporter />} />
                    <Route path="/elever/:elevId/kontrakter" element={<ElevKontrakter />} />
                    <Route path="/sikkerhetskontroll/rapporter" element={<SikkerhetskontrollRapporter />} />
                  </Routes>
                  </Suspense>
                </MainContent>
              </Layout>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
                ariaProps: {
                  role: 'status',
                  'aria-live': 'polite',
                },
              }}
            />
                      </Router>
            </AuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      {/* <PerformanceMonitor /> */}
    </QueryClientProvider>
  );
} 
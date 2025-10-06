import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppProviders from './providers/AppProviders';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Import ekte sider
import Oversikt from './pages/Oversikt/Index';
import Bedrifter from './pages/Bedrifter/Bedrifter';
import Ansatte from './pages/Ansatte';
import Elever from './pages/Elever';
import Kontrakter from './pages/Kontrakter/KontraktOversikt';
import NyKontrakt from './pages/Kontrakter/NyKontrakt';
import Sikkerhetskontroll from './pages/Sikkerhetskontroll/Admin/AdminOversikt';
import Quiz from './pages/Quiz/Index';
import Rapportering from './pages/Rapportering/BusinessIntelligence';
import Innstillinger from './pages/Innstillinger/System/SidebarAdmin';
import Kalender from './pages/Kalender';
import Nyheter from './pages/Nyheter';
import Oppgaver from './pages/Oppgaver/OppgaveOversikt';
import Prosjekt from './pages/Prosjekt/Index';
import Ressursplanlegging from './pages/Ressursplanlegging/Index';
import Hjelp from './pages/Hjelp/Index';
import Okonomi from './pages/Okonomi/Index';
import HR from './pages/HR/Index';
import AdminDashboard from './pages/Admin/Dashboard';

// Placeholder component for pages under development
const PagePlaceholder = ({ pageName }: { pageName: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h1 className="text-2xl font-bold mb-6 text-gray-900">{pageName}</h1>
    <div className="space-y-4">
      <p className="text-gray-600">Denne siden er under utvikling...</p>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          📍 Du er nå på: <strong>{pageName}</strong><br />
          🛣️ URL: <code className="bg-blue-100 px-1 rounded">{window.location.pathname}</code>
        </p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-green-800 text-sm">
          ✅ Routing fungerer! Du kan navigere mellom sider via sidebar-menyen.
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AppProviders>
      <Layout>
        <Routes>
          {/* Dashboard/Oversikt */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/oversikt" element={<Oversikt />} />
          
          {/* Bedrifter */}
          <Route path="/bedrifter" element={<Bedrifter />} />
          
          {/* Ansatte og Elever */}
          <Route path="/ansatte" element={<Ansatte />} />
          <Route path="/elever" element={<Elever />} />
          
          {/* Kontrakter */}
          <Route path="/kontrakter" element={<Kontrakter />} />
          <Route path="/kontrakter/ny" element={<NyKontrakt />} />
          <Route path="/kontrakter/:id" element={<Kontrakter />} />
          
          {/* Sikkerhetskontroll */}
          <Route path="/sikkerhetskontroll" element={<Sikkerhetskontroll />} />
          
          {/* Quiz */}
          <Route path="/quiz" element={<Quiz />} />
          
          {/* Rapportering */}
          <Route path="/rapportering" element={<Rapportering />} />
          
          {/* Innstillinger */}
          <Route path="/innstillinger" element={<Innstillinger />} />
          
          {/* Andre sider */}
          <Route path="/kalender" element={<Kalender />} />
          <Route path="/nyheter" element={<Nyheter />} />
          <Route path="/oppgaver" element={<Oppgaver />} />
          <Route path="/okonomi" element={<Okonomi />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/prosjekt" element={<Prosjekt />} />
          <Route path="/ressursplanlegging" element={<Ressursplanlegging />} />
          <Route path="/hjelp" element={<Hjelp />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Placeholder for kunde siden */}
          <Route path="/kunde" element={<PagePlaceholder pageName="Kunde" />} />
        </Routes>
      </Layout>
    </AppProviders>
  );
}

export default App; 
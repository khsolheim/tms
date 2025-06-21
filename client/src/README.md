# Src Struktur

Denne mappen inneholder alle kildekodene for React-applikasjonen.

## Mappestruktur

### `/components`
Organiserte React-komponenter:

- **`/ui`** - UI og layout-komponenter
  - `Header.tsx` - Hovednavigasjon og brukermenuer
  - `Sidebar.tsx` - Sidenavigasjon
  - `Layout.tsx` - Hovedlayout-wrapper
  - `index.ts` - Eksporter alle UI-komponenter

- **`/auth`** - Autentisering og autorisasjon
  - `ProtectedRoute.tsx` - Beskyttede ruter
  - `RoleRoute.tsx` - Rolle-baserte ruter
  - `RoleBased.tsx` - Rolle-baserte komponenter
  - `index.ts` - Eksporter alle auth-komponenter

- **`/forms`** - Skjemaer og dialoger
  - `AnsattDialog.tsx` - Dialog for ansattregistrering
  - `BildeVelger.tsx` - Komponent for bildevalg
  - `index.ts` - Eksporter alle form-komponenter

- **`index.ts`** - Hovedeksporter for alle komponenter

### `/pages`
Sider og ruter:

- Hovedsider: `Dashboard.tsx`, `Kalender.tsx`, `Nyheter.tsx`
- Moduler i egne mapper: `Quiz/`, `Sikkerhetskontroll/`, `Bedrifter/`, osv.
- Hver modulmappe har sine egne komponenter og undersider

### `/contexts`
React-kontekster:

- `AuthContext.tsx` - Autentisering og brukeradministrasjon
- `index.ts` - Eksporter alle kontekster

### `/lib`
Delte biblioteker og verktøy:

- `api.ts` - API-konfigurasjoner og hjelpefunksjoner
- `index.ts` - Eksporter alle biblioteker

### `/types`
TypeScript-typedefinasjoner:

- `roller.ts` - Rolle- og tilgangsdefinasjoner
- `index.ts` - Eksporter alle typer

### `/hooks`
Custom React hooks (reservert for fremtidig bruk)

## Import-mønstre

Bruk relative importer gjennom index-filer for bedre organisering:

```typescript
// Heller enn:
import Header from './components/ui/Header';
import AuthContext from './contexts/AuthContext';

// Bruk:
import { Header } from './components/ui';
import { useAuth } from './contexts';
```

## Filnavngivning

- React-komponenter: `PascalCase.tsx`
- Index-filer: `index.ts`
- Types og utilities: `camelCase.ts` 
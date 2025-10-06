# App Providers Documentation

## Oversikt
Dette mappen inneholder alle React Context Providers som brukes i TMS-applikasjonen.

## Provider-hierarki
Rekkefølgen av providers er viktig for å sikre at alle avhengigheter er tilgjengelige:

```
<AuthProvider>           // Øverst - andre contexts kan avhenge av brukerinfo
  <ThemeProvider>        // Tema og styling
    <AccessibilityProvider>  // Tilgjengelighet og a11y
      <I18nProvider>     // Internasjonalisering og oversettelser  
        <Router>         // React Router for navigasjon
          <App Content>
        </Router>
      </I18nProvider>
    </AccessibilityProvider>
  </ThemeProvider>
</AuthProvider>
```

## Context Providers

### 1. AuthProvider
- **Fil**: `../contexts/AuthContext.tsx`
- **Formål**: Brukerautentisering og autorisasjon
- **Hooks**: `useAuth()`
- **Brukes av**: Hele appen for å sjekke innlogging

### 2. ThemeProvider  
- **Fil**: `../contexts/ThemeContext.tsx`
- **Formål**: Tema-styring (lys/mørk modus)
- **Hooks**: `useTheme()`, `useThemeVariables()`
- **Brukes av**: Breadcrumbs, rapporter, analytics

### 3. AccessibilityProvider
- **Fil**: `../contexts/AccessibilityContext.tsx` 
- **Formål**: Tilgjengelighetsfunksjoner og a11y
- **Hooks**: `useAccessibility()`
- **Brukes av**: Layout og tilgjengelighetsfunksjoner

### 4. I18nProvider
- **Fil**: `../contexts/I18nContext.tsx`
- **Formål**: Internasjonalisering og språkstøtte
- **Hooks**: `useTranslation()`, `useLocale()`
- **Brukes av**: Layout, alle sider som trenger oversettelser

### 5. Router (React Router)
- **Formål**: URL-routing og navigasjon  
- **Hooks**: `useLocation()`, `useNavigate()`, `useParams()`
- **Brukes av**: Layout, alle sider med navigasjon

## Feilvansking

### "must be used within Provider" feil
Hvis du får denne feilen:
1. Sjekk at komponenten er wrappet i `<AppProviders>`
2. Sjekk at den relevante provideren er inkludert i `AppProviders.tsx`
3. Sjekk provider-rekkefølgen hvis det er avhengigheter

### Legge til ny provider
1. Opprett context i `../contexts/`
2. Importer og legg til i `AppProviders.tsx`
3. Plasser i riktig rekkefølge basert på avhengigheter
4. Oppdater denne dokumentasjonen

## Eksempel på bruk

```tsx
// Feil - vil gi "must be used within Provider" feil
function App() {
  return (
    <Layout>
      <Dashboard />  // useTheme() vil feile her
    </Layout>
  );
}

// Riktig - alle providers er tilgjengelige
function App() {
  return (
    <AppProviders>
      <Layout>
        <Dashboard />  // useTheme() fungerer perfekt
      </Layout>
    </AppProviders>
  );
}
```

## Fordeler med sentralisert provider-håndtering
- ✅ Unngår "must be used within Provider" feil
- ✅ Enkelt å legge til nye providers
- ✅ Tydelig oversikt over alle contexts
- ✅ Konsistent provider-rekkefølge  
- ✅ Lettere å debugge context-problemer 
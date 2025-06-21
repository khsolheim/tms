# TMS Internasjonalisering (i18n)

Dette dokumentet beskriver hvordan internasjonalisering er implementert i TMS.

## 🌍 Oversikt

TMS støtter flerspråklighet med norsk (NO) som standard og engelsk (EN) som alternativ. Systemet bruker React Context for state management og tilbyr omfattende formatering og oversettelser.

## 🔧 Arkitektur

### Komponenter
- **`I18nContext`** - React context for språkadministrasjon
- **`LanguageSelector`** - Dropdown for språkvalg
- **`LanguageSelectorButton`** - Kompakt språkknapp med flagg
- **Språkfiler** - JSON-strukturerte oversettelser

### Hooks
- **`useI18n()`** - Tilgang til alle i18n funksjoner
- **`useTranslation()`** - Enkel tilgang til oversettelser
- **`useLocale()`** - Språkstatus og endring

## 📁 Filstruktur

```
src/i18n/
├── index.ts              # Hovedexport og utility funksjoner
├── locales/
│   ├── no.json          # Norske oversettelser (337 linjer)
│   └── en.json          # Engelske oversettelser (337 linjer)
└── README.md            # Dette dokumentet
```

## 💡 Bruk

### Grunnleggende oversettelser
```tsx
import { useTranslation } from '../contexts/I18nContext';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.actions.save')}</button>
    </div>
  );
}
```

### Formatering
```tsx
import { useI18n } from '../contexts/I18nContext';

function FormattingExample() {
  const { formatNumber, formatCurrency, formatDate } = useI18n();
  
  return (
    <div>
      <p>Tall: {formatNumber(123456.789)}</p>
      <p>Valuta: {formatCurrency(99999.50)}</p>
      <p>Dato: {formatDate(new Date())}</p>
    </div>
  );
}
```

### Variable substitution
```tsx
// Oversettelse: "Hei {name}! Du har {count} nye meldinger."
<p>{t('demo.i18n.userGreeting', { name: 'Karsten', count: 42 })}</p>
```

### Språkvelger
```tsx
import { LanguageSelectorButton } from '../ui/LanguageSelector';

function Header() {
  return (
    <header>
      <LanguageSelectorButton />
    </header>
  );
}
```

## 🗂️ Oversettelsesstruktur

```json
{
  "common": {
    "welcome": "Velkommen",
    "actions": {
      "save": "Lagre",
      "cancel": "Avbryt",
      "delete": "Slett"
    }
  },
  "navigation": {
    "overview": "Oversikt",
    "companies": "Bedrifter",
    "contracts": "Kontrakter"
  },
  "validation": {
    "required": "Dette feltet er påkrevd",
    "email": "Ugyldig e-postadresse"
  }
}
```

## ⚙️ Konfiguration

### Tilgjengelige språk
- **NO** (Norsk) - Standard språk
- **EN** (English) - Alternativ språk

### Automatisk språkdeteksjon
1. Sjekker localStorage for lagret preferanse
2. Faller tilbake til browserspråk
3. Standard til norsk hvis ingen match

### Formatering per språk

#### Norsk (NO)
- Tall: `123 456,789`
- Valuta: `kr 99 999,50`
- Dato: `dd.MM.yyyy`
- Tid: `HH:mm`

#### Engelsk (EN)
- Tall: `123,456.789`
- Valuta: `$99,999.50` / `NOK 99,999.50`
- Dato: `MM/dd/yyyy`
- Tid: `hh:mm a`

## 🧪 Testing

Demo-komponenten (`I18nDemo`) viser alle funksjoner:
- Språkvelgere
- Oversettelser med variabler
- Formatering av tall, valuta og datoer
- Navigasjonsoversettelser
- Relativ tid formatering

## 🚀 Implementeringsstatus

- ✅ **Core system** - React context og state management
- ✅ **Språkfiler** - 337 oversettelser per språk
- ✅ **Formatering** - Tall, valuta, dato, relativ tid
- ✅ **Komponenter** - Language selectors og demo
- ✅ **Integration** - Hovedlayout og navigasjon
- ✅ **Persistence** - localStorage og browser detection
- 🔄 **Testing** - Pågående produksjonstesting

## 🔮 Fremtidige utvidelser

- [ ] Flere språk (svensk, dansk, tysk)
- [ ] Translation management system (Crowdin, Lokalise)
- [ ] Pluralization rules per språk
- [ ] RTL språkstøtte (arabisk, hebraisk)
- [ ] Kontekstuelle oversettelser (gender, formal/informal)
- [ ] Lazy loading av språkfiler
- [ ] Translation caching og performance optimization

## 📝 Bidrag

Når du legger til nye oversettelser:

1. Legg til nøkkel i begge språkfiler (`no.json` og `en.json`)
2. Bruk nested struktur for organisering
3. Test med variable substitution
4. Sjekk formatering med forskjellige locales
5. Oppdater demo-komponenten hvis relevant

---

*TMS i18n system - utviklet for skalerbar flerspråklig support* 🌍 
# SMTP E-postkonfigurasjon

For å aktivere e-postfunksjonalitet i TMS, må følgende miljøvariabler settes i `.env` filen:

## Påkrevde innstillinger

```env
# SMTP Server konfigurasjon
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=din-epost@gmail.com
SMTP_PASS=ditt-app-passord
SMTP_FROM=noreply@trafikkskole.no

# Applikasjon URL (for lenker i e-poster)
APP_URL=http://localhost:3000
```

## Eksempler for populære e-posttjenester

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=din-epost@gmail.com
SMTP_PASS=app-spesifikt-passord
```
**OBS**: For Gmail må du opprette et app-spesifikt passord:
1. Gå til [Google Account Settings](https://myaccount.google.com/)
2. Aktiver 2-faktor autentisering
3. Generer app-passord under Sikkerhet > App-passord

### Microsoft 365 / Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=din-epost@outlook.com
SMTP_PASS=ditt-passord
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=din-sendgrid-api-nøkkel
```

### Lokal testing med Mailhog
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

## Test e-postkonfigurasjon

Etter at miljøvariablene er satt:

1. Start serveren på nytt
2. Gå til Innstillinger > E-postinnstillinger i TMS
3. Klikk "Test servertilkobling" for å verifisere oppsettet
4. Send en test e-post for å bekrefte at alt fungerer

## Sikkerhet

- **ALDRI** commit `.env` filen til versjonskontroll
- Bruk sterke passord eller API-nøkler
- Vurder å bruke en dedikert e-posttjeneste for produksjon
- Aktiver SMTP_SECURE=true hvis mulig (krever port 465)

## Feilsøking

### "Connection timeout"
- Sjekk at SMTP_HOST og SMTP_PORT er korrekte
- Verifiser at brannmur ikke blokkerer utgående tilkoblinger

### "Invalid credentials"
- Dobbeltsjekk brukernavn og passord
- For Gmail: Sørg for at du bruker app-spesifikt passord
- Sjekk at kontoen ikke har 2FA som blokkerer SMTP

### "Self signed certificate"
- Sett NODE_TLS_REJECT_UNAUTHORIZED=0 (kun for utvikling!)
- Eller bruk riktig SSL-sertifikat i produksjon 
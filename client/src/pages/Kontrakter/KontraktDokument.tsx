import React from 'react';

interface KontraktData {
  // Elevinfo
  elevNavn: string;
  elevAdresse: string;
  elevFodselsnummer: string;
  
  // Fakturaansvarlig (valgfri)
  harFakturaansvarlig: boolean;
  fakturaansvarligNavn: string;
  fakturaansvarligAdresse: string;
  fakturaansvarligFodselsnummer: string;
  
  // Låneinformasjon
  lan: number;
  lopetid: number;
  rente: number;
  etableringsgebyr: number;
  termingebyr: number;
  terminerPerAr: number;
  inkludererGebyrerILan: boolean;
}

interface Beregning {
  effektivRente: number;
  renterOgGebyr: number;
  terminbelop: number;
  totalRente: number;
  totalBelop: number;
}

interface TerminDetaljer {
  terminNummer: number;
  terminbelop: number;
  renter: number;
  gebyrer: number;
  avdrag: number;
  restgjeld: number;
}

interface KontraktDokumentProps {
  kontraktData: KontraktData;
  beregning: Beregning;
  nedbetalingsplan: TerminDetaljer[];
  bedriftInfo?: {
    navn: string;
    adresse: string;
    orgNr: string;
    epost: string;
    telefon: string;
    logo?: string;
  };
}

export default function KontraktDokument({
  kontraktData,
  beregning,
  nedbetalingsplan,
  bedriftInfo = {
    navn: "Roalds Trafikkskole AS",
    adresse: "Spelhaugen 15, 5147 Fyllingsdalen",
    orgNr: "913 831 438",
    epost: "post@roaldstrafikkskole.no",
    telefon: "40 55 55 22",
    logo: "/logo.png"
  }
}: KontraktDokumentProps) {
  
  const currentDate = new Date();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('no-NO') + ' kr';
  };

  // Beregn første betalingsdato (14 dager frem)
  const forsteBetalingsdato = new Date(currentDate);
  forsteBetalingsdato.setDate(currentDate.getDate() + 14);

  return (
    <div className="max-w-4xl mx-auto bg-white px-2 py-1 print:p-6 print:max-w-none">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:break-after { page-break-after: always; }
          .print\\:break-before { page-break-before: always; }
          .print\\:no-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Header med bedriftsinformasjon og logo */}
      <div className="flex justify-between items-start mb-8 print:no-break">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{bedriftInfo.navn}</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{bedriftInfo.adresse}</p>
            <p>Org.nr.: {bedriftInfo.orgNr}</p>
            <p>E-post: {bedriftInfo.epost} · Tlf.: {bedriftInfo.telefon}</p>
          </div>
        </div>
        
        {/* Logo øverst i høyre hjørne */}
        <div className="ml-8">
          {bedriftInfo.logo ? (
            <img 
              src={bedriftInfo.logo} 
              alt={`${bedriftInfo.navn} logo`}
              className="h-16 w-auto"
            />
          ) : (
            <div className="h-16 w-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              LOGO
            </div>
          )}
        </div>
      </div>

      {/* Dokumentdato og sideinformasjon */}
      <div className="text-right text-sm text-gray-600 mb-6">
        <p>Dokumentets dato: {formatDate(currentDate)} kl. {currentDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>Side 1/1</p>
      </div>

      {/* Hovedtittel */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">
          {kontraktData.lopetid} MND Nedbetaling
        </h2>
        <p className="text-lg text-gray-700 mt-2">Nedbetalingsavtale</p>
      </div>

      {/* Fakturaansvarlig informasjon (uten emoji) */}
      {kontraktData.harFakturaansvarlig && (
        <div className="mb-8 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg print:no-break">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Fakturaansvarlig person
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid text-sm">
            <div>
              <p><strong>Navn:</strong> {kontraktData.fakturaansvarligNavn}</p>
              <p><strong>Fødselsnummer:</strong> {kontraktData.fakturaansvarligFodselsnummer}</p>
            </div>
            <div>
              <p><strong>Adresse:</strong> {kontraktData.fakturaansvarligAdresse}</p>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Alle fakturaer og betalingsinnkrevinger vil bli sendt til fakturaansvarlig person.
          </p>
        </div>
      )}

      {/* Elevens informasjon (uten emoji) */}
      <div className="mb-8 print:no-break">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Elevopplysninger</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm"><strong>Navn:</strong> {kontraktData.elevNavn}</p>
            <p className="text-sm"><strong>Fødselsnummer:</strong> {kontraktData.elevFodselsnummer}</p>
          </div>
          <div>
            <p className="text-sm"><strong>Adresse:</strong> {kontraktData.elevAdresse}</p>
          </div>
        </div>
      </div>

      {/* Avtaleintroduksjon */}
      <div className="mb-8 print:no-break">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Avtale inngått mellom:</h3>
        <div className="space-y-6 text-sm">
          <p><strong>{bedriftInfo.navn}</strong>, heretter kalt "Långiver",</p>
          <p className="ml-4">og</p>
          <p><strong>{kontraktData.elevNavn}</strong> {kontraktData.harFakturaansvarlig && `(med ${kontraktData.fakturaansvarligNavn} som fakturaansvarlig)`}, heretter kalt "Lånetaker".</p>
          <p className="text-xs text-gray-600 mt-3">
            (Lånetakers signatur fremgår av signaturseksjonen nederst i avtalen)
          </p>
        </div>
      </div>

      {/* Avtalevilkår */}
      <div className="cards-spacing-vertical mb-8">
        
        {/* 1. Formål */}
        <div className="print:no-break">
          <h4 className="text-base font-semibold text-gray-900 mb-2">1. Formål med avtalen</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            Denne avtalen regulerer et lån som Lånetaker inngår med Långiver for å finansiere 
            kjøreopplæring ved {bedriftInfo.navn}. Lånt beløp framkommer av faktura som vedlegg 
            til avtale. Faktura finnes i Dokumentarkiv på TABS. Lånet skal nedbetales i henhold 
            til vilkårene beskrevet nedenfor.
          </p>
        </div>

        {/* 2. Lånebeløp og kostnader */}
        <div className="print:no-break">
          <h4 className="text-base font-semibold text-gray-900 mb-3">2. Lånebeløp og kostnader</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid text-sm">
            <div className="space-y-6">
              <p><strong>Løpetid:</strong> {kontraktData.lopetid} måneder</p>
              <p><strong>Lånebeløp:</strong> {formatCurrency(kontraktData.lan)}</p>
              <p><strong>Etableringsgebyr:</strong> {formatCurrency(kontraktData.etableringsgebyr)} (engangsbeløp)</p>
            </div>
            <div className="space-y-6">
              <p><strong>Termingebyr:</strong> {formatCurrency(kontraktData.termingebyr)} per måned</p>
              <p><strong>Nominell rente:</strong> {kontraktData.rente}% per år</p>
              <p><strong>Effektiv rente:</strong> {beregning.effektivRente.toFixed(2)}% per år</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Effektiv rente inkluderer etableringsgebyr og termingebyr som fastsatt i nedbetalingsplanen nedenfor.
          </p>
        </div>

        {/* 3. Nedbetalingsplan */}
        <div className="print:no-break">
          <h4 className="text-base font-semibold text-gray-900 mb-2">3. Nedbetalingsplan</h4>
          <p className="text-sm text-gray-700 mb-3">
            Lånet nedbetales i henhold til en fastsatt nedbetalingsplan, som er vist i oversikten nedenfor.
          </p>
        </div>

        {/* 4. Betalingsbetingelser */}
        <div className="print:no-break">
          <h4 className="text-base font-semibold text-gray-900 mb-2">4. Betalingsbetingelser</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Første betalingsdato:</strong> {formatDate(forsteBetalingsdato)} (14 dager etter signert kontrakt)</p>
            <p><strong>Månedlig terminbeløp:</strong> {formatCurrency(beregning.terminbelop)}</p>
            <p><strong>Betalingsmåte:</strong> Automatisk trekk eller faktura</p>
            <p><strong>Forfall:</strong> Den 15. hver måned</p>
          </div>
        </div>

        {/* 5. Øvrige vilkår */}
        <div className="print:no-break">
          <h4 className="text-base font-semibold text-gray-900 mb-2">5. Øvrige vilkår</h4>
          <div className="text-sm text-gray-700 space-y-6">
            <p>• Ved forsinket betaling påløper forsinkelsesrente etter lov.</p>
            <p>• Lånet kan innfris uten varsel til pålydende restgjeld.</p>
            <p>• Tvister løses etter norsk rett med Bergen tingrett som verneting.</p>
            <p>• Avtalen gjelder fra signaturdato og frem til full innfrielse.</p>
          </div>
        </div>
      </div>

      {/* Sammendrag og lånoversikt (uten emoji, nøytrale farger, ingen gradient/skygge) */}
      <div className="mt-8 px-2 py-1 bg-white border border-gray-200 rounded-lg print:no-break">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Lånoversikt og sammendrag
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 cards-spacing-grid mb-6">
          <div className="text-center px-2 py-1 bg-gray-50 rounded border">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kontraktData.lan)}</p>
            <p className="text-xs text-gray-600">Lånebeløp</p>
          </div>
          <div className="text-center px-2 py-1 bg-gray-50 rounded border">
            <p className="text-2xl font-bold text-gray-900">{beregning.effektivRente.toFixed(2)}%</p>
            <p className="text-xs text-gray-600">Effektiv rente</p>
          </div>
          <div className="text-center px-2 py-1 bg-gray-50 rounded border">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(beregning.terminbelop)}</p>
            <p className="text-xs text-gray-600">Månedlig betaling</p>
          </div>
          <div className="text-center px-2 py-1 bg-gray-50 rounded border">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(beregning.totalBelop)}</p>
            <p className="text-xs text-gray-600">Total betaling</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid text-sm">
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Kostnadsoppbygging:</h4>
            <div className="space-y-1 pl-3">
              <p>Lånebeløp: {formatCurrency(kontraktData.lan)}</p>
              <p>Etableringsgebyr: {formatCurrency(kontraktData.etableringsgebyr)}</p>
              <p>Renter totalt: {formatCurrency(beregning.totalRente)}</p>
              <p>Termingebyrer ({kontraktData.lopetid} mnd): {formatCurrency(kontraktData.termingebyr * kontraktData.lopetid)}</p>
              <p className="border-t pt-1 font-semibold">Total kostnad: {formatCurrency(beregning.totalBelop)}</p>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Betalingsinformasjon:</h4>
            <div className="space-y-1 pl-3">
              <p>Løpetid: {kontraktData.lopetid} måneder</p>
              <p>Første forfall: {formatDate(forsteBetalingsdato)}</p>
              <p>Siste forfall: {formatDate(new Date(forsteBetalingsdato.getTime() + (kontraktData.lopetid - 1) * 30 * 24 * 60 * 60 * 1000))}</p>
              <p>Betalingsfrekvens: Månedlig</p>
              <p>Nominell rente: {kontraktData.rente}% p.a.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nedbetalingsplan på egen side (print:break-before), vis hele tabellen */}
      <div className="mt-8 print:break-before bg-white border border-gray-200 rounded-lg px-2 py-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Nedbetalingsplan</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left border-r border-gray-200">Mnd</th>
                <th className="px-2 py-1 text-right border-r border-gray-200">Terminbeløp</th>
                <th className="px-2 py-1 text-right border-r border-gray-200">Renter</th>
                <th className="px-2 py-1 text-right border-r border-gray-200">Gebyrer</th>
                <th className="px-2 py-1 text-right border-r border-gray-200">Avdrag</th>
                <th className="px-2 py-1 text-right">Restgjeld</th>
              </tr>
            </thead>
            <tbody>
              {nedbetalingsplan.map((termin, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-1 border-r border-gray-200">{termin.terminNummer}</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200">{termin.terminbelop.toLocaleString()}</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200">{termin.renter.toLocaleString()}</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200">{termin.gebyrer.toLocaleString()}</td>
                  <td className="px-2 py-1 text-right border-r border-gray-200">{termin.avdrag.toLocaleString()}</td>
                  <td className="px-2 py-1 text-right">{termin.restgjeld.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signaturområde */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300 print:no-break">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">✍️ Signaturer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
          {/* Lånetaker */}
          <div className="text-center">
            <div className="border-b-2 border-gray-400 mb-2 pb-8">
              {/* Signaturområde */}
            </div>
            <p className="text-sm font-semibold">{kontraktData.elevNavn}</p>
            <p className="text-xs text-gray-600">Lånetaker</p>
            <p className="text-xs text-gray-500 mt-1">Dato: _____________</p>
          </div>

          {/* Fakturaansvarlig (hvis relevant) */}
          {kontraktData.harFakturaansvarlig && (
            <div className="text-center">
              <div className="border-b-2 border-gray-400 mb-2 pb-8">
                {/* Signaturområde */}
              </div>
              <p className="text-sm font-semibold">{kontraktData.fakturaansvarligNavn}</p>
              <p className="text-xs text-gray-600">Fakturaansvarlig</p>
              <p className="text-xs text-gray-500 mt-1">Dato: _____________</p>
            </div>
          )}

          {/* Långiver */}
          <div className="text-center md:col-span-1">
            <div className="border-b-2 border-gray-400 mb-2 pb-8">
              {/* Signaturområde */}
            </div>
            <p className="text-sm font-semibold">{bedriftInfo.navn}</p>
            <p className="text-xs text-gray-600">Långiver</p>
            <p className="text-xs text-gray-500 mt-1">Dato: _____________</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Dette dokumentet er juridisk bindende når det er signert av begge parter.
          Kopi av signert avtale sendes til lånetaker innen 14 dager.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Generert: {formatDate(currentDate)} | {bedriftInfo.navn} | Org.nr: {bedriftInfo.orgNr}</p>
      </div>
    </div>
  );
} 
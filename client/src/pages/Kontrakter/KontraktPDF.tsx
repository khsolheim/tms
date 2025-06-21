import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// Registrer norske fonter for bedre støtte av æøå
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Definer stiler for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2pt solid #1e40af',
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: '1pt solid #e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    width: 150,
  },
  value: {
    fontSize: 11,
    color: '#1f2937',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: '#4b5563',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1pt solid #e5e7eb',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #e5e7eb',
  },
  tableCell: {
    fontSize: 10,
    color: '#1f2937',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderBottom: '1pt solid #1f2937',
    marginTop: 50,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
});

interface KontraktPDFProps {
  kontraktData: any;
  beregning: any;
  nedbetalingsplan?: any[];
  bedrift?: any;
}

// PDF Dokument komponent
const KontraktDokument: React.FC<KontraktPDFProps> = ({ 
  kontraktData, 
  beregning, 
  nedbetalingsplan = [],
  bedrift 
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('nb-NO')} kr`;
  };

  const formatDate = (date: Date = new Date()) => {
    return date.toLocaleDateString('nb-NO');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>NEDBETALINGSAVTALE</Text>
          <Text style={styles.subtitle}>
            Kontrakt ID: #{kontraktData.id || 'UTKAST'} | Dato: {formatDate()}
          </Text>
        </View>

        {/* Partsinformasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTER I AVTALEN</Text>
          
          {/* Kreditor */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Kreditor:</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Bedrift:</Text>
              <Text style={styles.value}>{bedrift?.navn || 'Trafikkskole AS'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Organisasjonsnummer:</Text>
              <Text style={styles.value}>{bedrift?.orgNummer || '999 999 999'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>
                {bedrift?.adresse || 'Eksempelgate 1'}, {bedrift?.postnummer || '0000'} {bedrift?.poststed || 'Oslo'}
              </Text>
            </View>
          </View>

          {/* Debitor */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Debitor (Elev):</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Navn:</Text>
              <Text style={styles.value}>{kontraktData.elevFornavn} {kontraktData.elevEtternavn}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Personnummer:</Text>
              <Text style={styles.value}>{kontraktData.elevPersonnummer}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>
                {kontraktData.elevGate}, {kontraktData.elevPostnr} {kontraktData.elevPoststed}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Telefon:</Text>
              <Text style={styles.value}>{kontraktData.elevTelefon}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>E-post:</Text>
              <Text style={styles.value}>{kontraktData.elevEpost}</Text>
            </View>
          </View>

          {/* Fakturaansvarlig hvis relevant */}
          {kontraktData.harFakturaansvarlig && (
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Fakturaansvarlig:</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Navn:</Text>
                <Text style={styles.value}>
                  {kontraktData.fakturaansvarligFornavn} {kontraktData.fakturaansvarligEtternavn}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Personnummer:</Text>
                <Text style={styles.value}>{kontraktData.fakturaansvarligPersonnummer}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Adresse:</Text>
                <Text style={styles.value}>
                  {kontraktData.fakturaansvarligGate}, {kontraktData.fakturaansvarligPostnr} {kontraktData.fakturaansvarligPoststed}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Låneinformasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LÅNEINFORMASJON</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lånebeløp:</Text>
              <Text style={styles.infoValue}>{formatCurrency(kontraktData.lan)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Løpetid:</Text>
              <Text style={styles.infoValue}>{kontraktData.lopetid} måneder</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nominell rente:</Text>
              <Text style={styles.infoValue}>{kontraktData.rente}% p.a.</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Effektiv rente:</Text>
              <Text style={styles.infoValue}>{beregning.effektivRente}% p.a.</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Etableringsgebyr:</Text>
              <Text style={styles.infoValue}>{formatCurrency(kontraktData.etableringsgebyr)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Termingebyr:</Text>
              <Text style={styles.infoValue}>{formatCurrency(kontraktData.termingebyr)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Terminbeløp:</Text>
              <Text style={styles.infoValue}>{formatCurrency(beregning.terminbelop)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Totalt å betale:</Text>
              <Text style={[styles.infoValue, { fontSize: 14 }]}>{formatCurrency(beregning.totalBelop)}</Text>
            </View>
          </View>
        </View>

        {/* Betalingsbetingelser */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BETALINGSBETINGELSER</Text>
          <Text style={{ fontSize: 11, marginBottom: 5, lineHeight: 1.5 }}>
            1. Låntaker forplikter seg til å betale {formatCurrency(beregning.terminbelop)} per måned i {kontraktData.lopetid} måneder.
          </Text>
          <Text style={{ fontSize: 11, marginBottom: 5, lineHeight: 1.5 }}>
            2. Første forfall er den 1. i måneden etter kontraktsinngåelse.
          </Text>
          <Text style={{ fontSize: 11, marginBottom: 5, lineHeight: 1.5 }}>
            3. Ved forsinket betaling påløper forsinkelsesrente i henhold til forsinkelsesrenteloven.
          </Text>
          <Text style={{ fontSize: 11, marginBottom: 5, lineHeight: 1.5 }}>
            4. Låntaker har rett til å innfri lånet før tiden uten ekstra kostnader.
          </Text>
        </View>

        {/* Signatur-seksjon */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Kreditor</Text>
            <Text style={[styles.signatureLabel, { marginTop: 5 }]}>
              Sted/Dato: ________________
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Debitor</Text>
            <Text style={[styles.signatureLabel, { marginTop: 5 }]}>
              Sted/Dato: ________________
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dette er en juridisk bindende avtale. Les nøye gjennom før signering.
          </Text>
          <Text style={styles.footerText}>
            {bedrift?.navn || 'Trafikkskole AS'} | Org.nr: {bedrift?.orgNummer || '999 999 999'} | Telefon: {bedrift?.telefon || '99 99 99 99'}
          </Text>
        </View>
      </Page>

      {/* Side 2 - Nedbetalingsplan hvis den finnes */}
      {nedbetalingsplan && nedbetalingsplan.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>NEDBETALINGSPLAN</Text>
            <Text style={styles.subtitle}>
              Vedlegg til kontrakt #{kontraktData.id || 'UTKAST'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DETALJERT NEDBETALINGSPLAN</Text>
            
            {/* Tabell header */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Termin</Text>
                <Text style={styles.tableHeaderCell}>Terminbeløp</Text>
                <Text style={styles.tableHeaderCell}>Herav renter</Text>
                <Text style={styles.tableHeaderCell}>Herav gebyr</Text>
                <Text style={styles.tableHeaderCell}>Avdrag</Text>
                <Text style={styles.tableHeaderCell}>Restgjeld</Text>
              </View>

              {/* Tabell rader */}
              {nedbetalingsplan.slice(0, 36).map((termin, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{termin.terminNummer}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(termin.terminbelop)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(termin.renter)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(termin.gebyrer)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(termin.avdrag)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(termin.restgjeld)}</Text>
                </View>
              ))}
            </View>

            {/* Oppsummering */}
            <View style={[styles.infoBox, { marginTop: 20 }]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sum terminbeløp:</Text>
                <Text style={styles.infoValue}>{formatCurrency(beregning.totalBelop)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sum renter og gebyrer:</Text>
                <Text style={styles.infoValue}>{formatCurrency(beregning.renterOgGebyr)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lånebeløp:</Text>
                <Text style={styles.infoValue}>{formatCurrency(kontraktData.lan)}</Text>
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

// Eksporter både dokumentet og nedlastingslink-komponenten
export { KontraktDokument };

interface PDFDownloadButtonProps {
  kontraktData: any;
  beregning: any;
  nedbetalingsplan?: any[];
  bedrift?: any;
  children: React.ReactNode;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  kontraktData, 
  beregning, 
  nedbetalingsplan,
  bedrift,
  children 
}) => {
  const fileName = `kontrakt_${kontraktData.elevFornavn}_${kontraktData.elevEtternavn}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <KontraktDokument 
          kontraktData={kontraktData} 
          beregning={beregning} 
          nedbetalingsplan={nedbetalingsplan}
          bedrift={bedrift}
        />
      }
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => {
        if (loading) return <span>Genererer PDF...</span>;
        if (error) {
          const msg = typeof error === 'string' ? error : (error?.message || 'Ukjent feil ved generering av PDF');
          return <span style={{ color: 'red' }}>Feil: {msg}</span>;
        }
        return <span>{children}</span>;
      }}
    </PDFDownloadLink>
  );
}; 
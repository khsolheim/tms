export interface RequiredSignature {
  role: string;
  name: string;
  required: boolean;
}

export interface CompletedSignature {
  role: string;
  name: string;
  signedDate: string;
  signature: string; // Base64 signature data
}

export interface SigningDocument {
  id: string;
  title: string;
  company: string;
  type: 'safety_check' | 'inspection' | 'audit';
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  createdDate: string;
  dueDate: string;
  requiredSignatures: RequiredSignature[];
  completedSignatures: CompletedSignature[];
  urgency: 'low' | 'medium' | 'high';
}

export interface AvtegningStatistikk {
  totalDocuments: number;
  pendingSignatures: number;
  completedSignatures: number;
  expiredDocuments: number;
  averageSigningTime: number;
}

export interface AvtegningFilter {
  status?: 'all' | 'pending' | 'signed' | 'rejected' | 'expired';
  type?: 'safety_check' | 'inspection' | 'audit';
  urgency?: 'low' | 'medium' | 'high';
  company?: string;
  dateFrom?: string;
  dateTo?: string;
}

class AvtegningService {
  private baseUrl = '/api/avtegning';

  async hentDokumenter(filter?: AvtegningFilter): Promise<SigningDocument[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter?.type) params.append('type', filter.type);
      if (filter?.urgency) params.append('urgency', filter.urgency);
      if (filter?.company) params.append('company', filter.company);
      if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter?.dateTo) params.append('dateTo', filter.dateTo);

      const response = await fetch(`${this.baseUrl}/dokumenter?${params}`);
      if (!response.ok) throw new Error('Kunne ikke hente dokumenter');
      return await response.json();
    } catch (error) {
      console.error('Feil ved henting av dokumenter:', error);
      // Fallback data for utvikling
      return [
        {
          id: '1',
          title: 'HMS Kontroll - Hovedlager',
          company: 'ABC Transport AS',
          type: 'safety_check',
          status: 'pending',
          createdDate: '2025-06-10',
          dueDate: '2025-06-17',
          urgency: 'high',
          requiredSignatures: [
            { role: 'HMS Ansvarlig', name: 'Per Hansen', required: true },
            { role: 'Leder', name: 'Kari Olsen', required: true },
            { role: 'Verneombud', name: 'Ole Nordahl', required: false }
          ],
          completedSignatures: [
            { role: 'HMS Ansvarlig', name: 'Per Hansen', signedDate: '2025-06-12', signature: 'signature_data_1' }
          ]
        },
        {
          id: '2',
          title: 'Brannøvelse Rapport',
          company: 'XYZ Logistics',
          type: 'inspection',
          status: 'signed',
          createdDate: '2025-06-05',
          dueDate: '2025-06-12',
          urgency: 'medium',
          requiredSignatures: [
            { role: 'Brannvernleder', name: 'Anne Berg', required: true },
            { role: 'Daglig leder', name: 'Tom Eriksen', required: true }
          ],
          completedSignatures: [
            { role: 'Brannvernleder', name: 'Anne Berg', signedDate: '2025-06-10', signature: 'signature_data_2' },
            { role: 'Daglig leder', name: 'Tom Eriksen', signedDate: '2025-06-11', signature: 'signature_data_3' }
          ]
        },
        {
          id: '3',
          title: 'Førstehjelpsutstyr Kontroll',
          company: 'Nordic Freight',
          type: 'safety_check',
          status: 'pending',
          createdDate: '2025-06-14',
          dueDate: '2025-06-21',
          urgency: 'low',
          requiredSignatures: [
            { role: 'Førstehjelper', name: 'Lisa Andersen', required: true }
          ],
          completedSignatures: []
        }
      ];
    }
  }

  async hentDokument(id: string): Promise<SigningDocument | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dokumenter/${id}`);
      if (!response.ok) throw new Error('Kunne ikke hente dokument');
      return await response.json();
    } catch (error) {
      console.error('Feil ved henting av dokument:', error);
      return null;
    }
  }

  async lagreSignatur(dokumentId: string, signaturData: string, rolle: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/dokumenter/${dokumentId}/signatur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signaturData,
          rolle,
          signertDato: new Date().toISOString()
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Feil ved lagring av signatur:', error);
      return false;
    }
  }

  async hentStatistikk(): Promise<AvtegningStatistikk> {
    try {
      const response = await fetch(`${this.baseUrl}/statistikk`);
      if (!response.ok) throw new Error('Kunne ikke hente statistikk');
      return await response.json();
    } catch (error) {
      console.error('Feil ved henting av statistikk:', error);
      return {
        totalDocuments: 0,
        pendingSignatures: 0,
        completedSignatures: 0,
        expiredDocuments: 0,
        averageSigningTime: 0
      };
    }
  }

  async opprettDokument(dokument: Omit<SigningDocument, 'id' | 'createdDate' | 'completedSignatures'>): Promise<SigningDocument | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dokumenter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dokument,
          createdDate: new Date().toISOString().split('T')[0],
          completedSignatures: []
        }),
      });
      if (!response.ok) throw new Error('Kunne ikke opprette dokument');
      return await response.json();
    } catch (error) {
      console.error('Feil ved opprettelse av dokument:', error);
      return null;
    }
  }

  async slettDokument(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/dokumenter/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Feil ved sletting av dokument:', error);
      return false;
    }
  }
}

export const avtegningService = new AvtegningService(); 
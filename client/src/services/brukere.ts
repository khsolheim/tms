import { ApiResponse, Bruker, PaginationParams, PaginatedResponse } from '../types/admin';

class BrukereService {
  private baseUrl = 'http://localhost:4000/api/brukere';

  async getBrukere(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Bruker>>> {
    try {
      // Return mock data for demo mode
      const mockBrukere: Bruker[] = [
        {
          id: '1',
          fornavn: 'John',
          etternavn: 'Doe',
          navn: 'John Doe',
          epost: 'john@acme.com',
          rolle: 'ADMIN',
          status: 'ACTIVE',
          bedrift: {
            navn: 'Acme Corporation AS',
            id: '1'
          },
          telefon: '+47 123 45 678',
          sistInnlogget: '2024-12-15T09:15:00Z',
          opprettet: '2024-01-15T10:30:00Z',
          tofaAktivert: true
        },
        {
          id: '2',
          fornavn: 'Jane',
          etternavn: 'Smith',
          navn: 'Jane Smith',
          epost: 'jane@techstart.no',
          rolle: 'BRUKER',
          status: 'ACTIVE',
          bedrift: {
            navn: 'TechStart Solutions',
            id: '2'
          },
          telefon: '+47 987 65 432',
          sistInnlogget: '2024-12-15T11:30:00Z',
          opprettet: '2024-02-20T14:20:00Z',
          tofaAktivert: false
        },
        {
          id: '3',
          fornavn: 'Ole',
          etternavn: 'Hansen',
          navn: 'Ole Hansen',
          epost: 'ole@bergenmaritim.no',
          rolle: 'BRUKER',
          status: 'LOCKED',
          bedrift: {
            navn: 'Bergen Maritim AS',
            id: '3'
          },
          telefon: '+47 555 12 345',
          sistInnlogget: '2024-11-20T16:20:00Z',
          opprettet: '2024-03-10T08:45:00Z',
          tofaAktivert: false
        }
      ];

      // Simple filtering based on search
      let filteredBrukere = mockBrukere;
      if (params.search) {
        filteredBrukere = mockBrukere.filter(bruker =>
          bruker.navn?.toLowerCase().includes(params.search!.toLowerCase()) ||
          bruker.epost.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      // Simple pagination
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const paginatedData = filteredBrukere.slice(start, end);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: filteredBrukere.length,
            totalPages: Math.ceil(filteredBrukere.length / params.limit),
            hasNextPage: end < filteredBrukere.length,
            hasPreviousPage: params.page > 1
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page: params.page,
            limit: params.limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        },
        errors: ['Failed to fetch brukere']
      };
    }
  }

  async performBrukerAction(id: string, action: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'resetPassword' | 'delete'): Promise<ApiResponse<boolean>> {
    try {
      // Mock action
      return {
        success: true,
        data: true,
        message: `Bruker action ${action} performed successfully`
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: [`Failed to perform ${action} on bruker`]
      };
    }
  }
}

const brukereService = new BrukereService();
export { brukereService };
export default brukereService; 
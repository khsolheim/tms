import { ApiResponse, Bedrift, PaginationParams, PaginatedResponse } from '../../types/admin';

class BedrifterService {
  private baseUrl = 'http://localhost:4000/api/admin/bedrifter';

  async getAllBedrifter(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Bedrift>>> {
    try {
      // Return mock data for demo mode
      const mockBedrifter: Bedrift[] = [
        {
          id: '1',
          navn: 'Acme Corporation AS',
          organisasjonsnummer: '123456789',
          status: 'ACTIVE',
          hovedbruker: {
            navn: 'John Doe',
            epost: 'john@acme.com'
          },
          antallAnsatte: 25,
          antallElever: 12,
          ansatte: 25,
          elever: 12,
          aktiveTjenester: 8,
          opprettet: '2024-01-15T10:30:00Z',
          sistAktiv: '2024-12-15T09:15:00Z',
          adresse: 'Storgata 1',
          postnummer: '0001',
          poststed: 'Oslo'
        },
        {
          id: '2',
          navn: 'TechStart Solutions',
          organisasjonsnummer: '987654321',
          status: 'ACTIVE',
          hovedbruker: {
            navn: 'Jane Smith',
            epost: 'jane@techstart.no'
          },
          antallAnsatte: 45,
          antallElever: 28,
          ansatte: 45,
          elever: 28,
          aktiveTjenester: 12,
          opprettet: '2024-02-20T14:20:00Z',
          sistAktiv: '2024-12-15T11:30:00Z',
          adresse: 'Teknologigata 15',
          postnummer: '7030',
          poststed: 'Trondheim'
        },
        {
          id: '3',
          navn: 'Bergen Maritim AS',
          organisasjonsnummer: '555666777',
          status: 'INACTIVE',
          hovedbruker: {
            navn: 'Ole Hansen',
            epost: 'ole@bergenmaritim.no'
          },
          antallAnsatte: 18,
          antallElever: 5,
          ansatte: 18,
          elever: 5,
          aktiveTjenester: 3,
          opprettet: '2024-03-10T08:45:00Z',
          sistAktiv: '2024-11-20T16:20:00Z',
          adresse: 'Havnegata 22',
          postnummer: '5003',
          poststed: 'Bergen'
        }
      ];

      // Simple filtering based on search
      let filteredBedrifter = mockBedrifter;
      if (params.search) {
        filteredBedrifter = mockBedrifter.filter(bedrift =>
          bedrift.navn.toLowerCase().includes(params.search!.toLowerCase()) ||
          bedrift.organisasjonsnummer.includes(params.search!)
        );
      }

      // Simple pagination
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const paginatedData = filteredBedrifter.slice(start, end);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: filteredBedrifter.length,
            totalPages: Math.ceil(filteredBedrifter.length / params.limit),
            hasNextPage: end < filteredBedrifter.length,
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
        errors: ['Failed to fetch bedrifter']
      };
    }
  }

  async getBedrift(id: string): Promise<ApiResponse<Bedrift>> {
    try {
      // Mock single bedrift fetch
      const mockBedrift: Bedrift = {
        id,
        navn: 'Acme Corporation AS',
        organisasjonsnummer: '123456789',
        status: 'ACTIVE',
        hovedbruker: {
          navn: 'John Doe',
          epost: 'john@acme.com'
        },
        antallAnsatte: 25,
        antallElever: 12,
        ansatte: 25,
        elever: 12,
        aktiveTjenester: 8,
        opprettet: '2024-01-15T10:30:00Z',
        sistAktiv: '2024-12-15T09:15:00Z',
        adresse: 'Storgata 1',
        postnummer: '0001',
        poststed: 'Oslo'
      };

      return {
        success: true,
        data: mockBedrift
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Bedrift,
        errors: ['Failed to fetch bedrift']
      };
    }
  }

  async updateBedriftStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ApiResponse<Bedrift>> {
    try {
      // Mock status update
      const updatedBedrift: Bedrift = {
        id,
        navn: 'Acme Corporation AS',
        organisasjonsnummer: '123456789',
        status,
        hovedbruker: {
          navn: 'John Doe',
          epost: 'john@acme.com'
        },
        antallAnsatte: 25,
        antallElever: 12,
        ansatte: 25,
        elever: 12,
        aktiveTjenester: 8,
        opprettet: '2024-01-15T10:30:00Z',
        sistAktiv: new Date().toISOString(),
        adresse: 'Storgata 1',
        postnummer: '0001',
        poststed: 'Oslo'
      };

      return {
        success: true,
        data: updatedBedrift,
        message: 'Bedrift status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Bedrift,
        errors: ['Failed to update bedrift status']
      };
    }
  }

  async deleteBedrift(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock deletion
      return {
        success: true,
        data: true,
        message: 'Bedrift deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to delete bedrift']
      };
    }
  }

  async suspendBedrift(id: string, reason: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock suspension
      return {
        success: true,
        data: true,
        message: 'Bedrift suspended successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to suspend bedrift']
      };
    }
  }

  async getBedrifter(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Bedrift>>> {
    // Alias for getAllBedrifter for compatibility
    return this.getAllBedrifter(params);
  }

  async performBedriftAction(bedriftId: string, action: string, data?: any): Promise<ApiResponse<boolean>> {
    try {
      console.log(`Performing action ${action} on bedrift ${bedriftId}`, data);
      
      switch (action) {
        case 'activate':
          await this.updateBedriftStatus(bedriftId, 'ACTIVE');
          break;
        case 'deactivate':
          await this.updateBedriftStatus(bedriftId, 'INACTIVE');
          break;
        case 'suspend':
          await this.suspendBedrift(bedriftId, data?.reason || 'Administrative action');
          break;
        case 'delete':
          await this.deleteBedrift(bedriftId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        data: true,
        message: `Action ${action} completed successfully`
      };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        errors: [error.message || 'Failed to perform action']
      };
    }
  }
}

const bedrifterService = new BedrifterService();
export { bedrifterService };
export default bedrifterService; 
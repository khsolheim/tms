import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../src/middleware/validation';
import { ValidationError } from '../../src/utils/errors';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRequest', () => {
    const testSchema = z.object({
      body: z.object({
        navn: z.string().min(1, 'Navn er påkrevd'),
        epost: z.string().email('Ugyldig epost'),
      }),
    });

    it('skal validere gyldig request data', async () => {
      mockRequest = {
        body: {
          navn: 'Test Bruker',
          epost: 'test@example.com',
        },
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('skal returnere ValidationError for ugyldig data', async () => {
      mockRequest = {
        body: {
          navn: '',
          epost: 'ugyldig-epost',
        },
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('skal håndtere manglende body', async () => {
      mockRequest = {
        body: undefined,
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('skal validere params og query også', async () => {
      const schemaWithParams = z.object({
        params: z.object({
          id: z.string().regex(/^\d+$/, 'ID må være et nummer'),
        }),
        query: z.object({
          page: z.string().optional(),
        }),
      });

      mockRequest = {
        params: { id: '123' },
        query: { page: '1' },
      };

      const middleware = validate(schemaWithParams);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('skal feile for ugyldig params', async () => {
      const schemaWithParams = z.object({
        params: z.object({
          id: z.string().regex(/^\d+$/, 'ID må være et nummer'),
        }),
      });

      mockRequest = {
        params: { id: 'abc' },
      };

      const middleware = validate(schemaWithParams);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });
}); 
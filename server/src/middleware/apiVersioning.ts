/**
 * API Versioning Middleware
 * 
 * Håndterer API-versjonering med støtte for:
 * - Header-basert versioning (Accept-Version)
 * - URL-basert versioning (/api/v1/...)
 * - Backward compatibility
 * - Deprecation warnings
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
  supportedUntil?: Date;
}

export interface VersioningConfig {
  defaultVersion: string;
  supportedVersions: ApiVersion[];
  strictVersioning?: boolean; // True = reject unsupported versions
  deprecationWarnings?: boolean; // True = send deprecation headers
}

// Default configuration
const defaultConfig: VersioningConfig = {
  defaultVersion: 'v1',
  supportedVersions: [
    {
      version: 'v1',
      deprecated: false
    }
  ],
  strictVersioning: false,
  deprecationWarnings: true
};

/**
 * Extract version from request
 */
function extractVersion(req: Request, config: VersioningConfig): {
  version: string;
  source: 'header' | 'url' | 'default';
} {
  // 1. Check URL path for version (/api/v1/...)
  const urlMatch = req.originalUrl.match(/^\/api\/v(\d+(?:\.\d+)?)\//);
  if (urlMatch) {
    return {
      version: `v${urlMatch[1]}`,
      source: 'url'
    };
  }

  // 2. Check Accept-Version header
  const headerVersion = req.headers['accept-version'] as string;
  if (headerVersion) {
    // Support both "v1" and "1" formats
    const normalizedVersion = headerVersion.startsWith('v') 
      ? headerVersion 
      : `v${headerVersion}`;
    
    return {
      version: normalizedVersion,
      source: 'header'
    };
  }

  // 3. Use default version
  return {
    version: config.defaultVersion,
    source: 'default'
  };
}

/**
 * Validate if version is supported
 */
function isVersionSupported(version: string, config: VersioningConfig): {
  supported: boolean;
  versionInfo?: ApiVersion;
} {
  const versionInfo = config.supportedVersions.find(v => v.version === version);
  return {
    supported: !!versionInfo,
    versionInfo
  };
}

/**
 * Add deprecation headers
 */
function addDeprecationHeaders(res: Response, versionInfo: ApiVersion): void {
  if (versionInfo.deprecated) {
    res.setHeader('Deprecation', 'true');
    
    if (versionInfo.deprecationDate) {
      res.setHeader('Deprecation-Date', versionInfo.deprecationDate.toISOString());
    }
    
    if (versionInfo.sunsetDate) {
      res.setHeader('Sunset', versionInfo.sunsetDate.toISOString());
    }
    
    if (versionInfo.supportedUntil) {
      res.setHeader('Supported-Until', versionInfo.supportedUntil.toISOString());
    }

    // Add Link header for newer version
    res.setHeader('Link', '</api/v2/>; rel="successor-version"');
  }
}

/**
 * API versioning middleware
 */
export function apiVersioning(config: VersioningConfig = defaultConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { version, source } = extractVersion(req, config);
      const { supported, versionInfo } = isVersionSupported(version, config);

      // Add version info to request
      (req as any).apiVersion = {
        version,
        source,
        supported,
        info: versionInfo
      };

      // Add API version header to response
      res.setHeader('API-Version', version);
      res.setHeader('API-Version-Source', source);

      // Handle unsupported versions
      if (!supported) {
        if (config.strictVersioning) {
          logger.warn('Unsupported API version requested', {
            requestedVersion: version,
            supportedVersions: config.supportedVersions.map(v => v.version),
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('user-agent')
          });

                     res.status(400).json({
             error: {
               code: 'UNSUPPORTED_API_VERSION',
               message: `API versjon ${version} støttes ikke`,
               supportedVersions: config.supportedVersions.map(v => v.version),
               defaultVersion: config.defaultVersion
             }
           });
           return;
        } else {
          // Fallback to default version with warning
          logger.warn('Unsupported API version, falling back to default', {
            requestedVersion: version,
            defaultVersion: config.defaultVersion,
            url: req.originalUrl
          });

          (req as any).apiVersion.version = config.defaultVersion;
          res.setHeader('API-Version', config.defaultVersion);
          res.setHeader('API-Version-Fallback', 'true');
        }
      }

      // Add deprecation headers if needed
      if (versionInfo && config.deprecationWarnings) {
        addDeprecationHeaders(res, versionInfo);
      }

      // Log version usage for analytics
      logger.debug('API version used', {
        version: (req as any).apiVersion.version,
        source,
        endpoint: req.originalUrl,
        method: req.method,
        supported,
        deprecated: versionInfo?.deprecated || false
      });

      next();
    } catch (error) {
      logger.error('Error in API versioning middleware', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.originalUrl,
        requestId: (req as any).requestId
      });
      
      // Continue with default version on error
      (req as any).apiVersion = {
        version: config.defaultVersion,
        source: 'default',
        supported: true
      };
      
      res.setHeader('API-Version', config.defaultVersion);
      next();
    }
  };
}

/**
 * Version-specific route wrapper
 */
export function versionedRoute(supportedVersions: string[], handler: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentVersion = (req as any).apiVersion?.version;
    
    if (!currentVersion) {
      return res.status(500).json({
        error: {
          code: 'VERSION_NOT_DETECTED',
          message: 'API versjon kunne ikke detekteres'
        }
      });
    }

    if (!supportedVersions.includes(currentVersion)) {
      return res.status(400).json({
        error: {
          code: 'VERSION_NOT_SUPPORTED_FOR_ENDPOINT',
          message: `Endpoint støtter ikke versjon ${currentVersion}`,
          supportedVersions
        }
      });
    }

    handler(req, res, next);
  };
}

/**
 * Require specific version middleware
 */
export function requireVersion(version: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentVersion = (req as any).apiVersion?.version;
    
    if (currentVersion !== version) {
      return res.status(400).json({
        error: {
          code: 'SPECIFIC_VERSION_REQUIRED',
          message: `Dette endepunktet krever versjon ${version}`,
          currentVersion,
          requiredVersion: version
        }
      });
    }

    next();
  };
}

/**
 * Default TMS API versioning configuration
 */
export const TMS_API_CONFIG: VersioningConfig = {
  defaultVersion: 'v1',
  supportedVersions: [
    {
      version: 'v1',
      deprecated: false
    },
    // Future versions can be added here
    // {
    //   version: 'v2',
    //   deprecated: false
    // }
  ],
  strictVersioning: false,
  deprecationWarnings: true
};

/**
 * TMS API versioning middleware (pre-configured)
 */
export const tmsApiVersioning = apiVersioning(TMS_API_CONFIG);

// Extend Express Request type to include API version
declare global {
  namespace Express {
    interface Request {
      apiVersion?: {
        version: string;
        source: 'header' | 'url' | 'default';
        supported: boolean;
        info?: ApiVersion;
      };
    }
  }
} 
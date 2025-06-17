export interface ApiVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface VersionedEndpoint {
  version: ApiVersion;
  path: string;
  handler: any;
  deprecated?: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
}

export class ApiVersionManager {
  private endpoints: Map<string, VersionedEndpoint[]> = new Map();
  private defaultVersion: ApiVersion = { major: 1, minor: 0, patch: 0 };

  constructor(defaultVersion?: ApiVersion) {
    if (defaultVersion) {
      this.defaultVersion = defaultVersion;
    }
  }

  // Register versioned endpoint
  registerEndpoint(
    path: string,
    version: ApiVersion,
    handler: any,
    options?: {
      deprecated?: boolean;
      deprecationDate?: Date;
      sunsetDate?: Date;
    }
  ): void {
    const versionKey = this.getVersionKey(version);
    const endpoint: VersionedEndpoint = {
      version,
      path,
      handler,
      deprecated: options?.deprecated || false,
      deprecationDate: options?.deprecationDate,
      sunsetDate: options?.sunsetDate
    };

    if (!this.endpoints.has(path)) {
      this.endpoints.set(path, []);
    }

    const pathEndpoints = this.endpoints.get(path)!;
    
    // Remove existing endpoint with same version
    const existingIndex = pathEndpoints.findIndex(e => 
      this.compareVersions(e.version, version) === 0
    );
    
    if (existingIndex >= 0) {
      pathEndpoints[existingIndex] = endpoint;
    } else {
      pathEndpoints.push(endpoint);
      // Sort by version (newest first)
      pathEndpoints.sort((a, b) => this.compareVersions(b.version, a.version));
    }

    console.log(`📝 Registered API endpoint: ${path} v${versionKey}`);
  }

  // Get handler for specific version
  getHandler(path: string, requestedVersion?: ApiVersion): VersionedEndpoint | null {
    const pathEndpoints = this.endpoints.get(path);
    if (!pathEndpoints || pathEndpoints.length === 0) {
      return null;
    }

    const targetVersion = requestedVersion || this.defaultVersion;

    // Find exact match first
    let exactMatch = pathEndpoints.find(e => 
      this.compareVersions(e.version, targetVersion) === 0
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Find compatible version (same major, minor >= requested)
    let compatibleMatch = pathEndpoints.find(e => 
      e.version.major === targetVersion.major &&
      e.version.minor >= targetVersion.minor
    );

    if (compatibleMatch) {
      return compatibleMatch;
    }

    // Fallback to latest version with same major
    let majorMatch = pathEndpoints.find(e => 
      e.version.major === targetVersion.major
    );

    if (majorMatch) {
      return majorMatch;
    }

    // Last resort: return latest version
    return pathEndpoints[0];
  }

  // Parse version from request headers or path
  parseVersionFromRequest(req: any): ApiVersion | null {
    // Check Accept header: Accept: application/vnd.tms.v2+json
    const acceptHeader = req.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/vnd\.tms\.v(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
      if (versionMatch) {
        return {
          major: parseInt(versionMatch[1]) || 1,
          minor: parseInt(versionMatch[2]) || 0,
          patch: parseInt(versionMatch[3]) || 0
        };
      }
    }

    // Check custom header: X-API-Version: 2.1.0
    const versionHeader = req.headers['x-api-version'];
    if (versionHeader) {
      const parts = versionHeader.split('.').map((p: string) => parseInt(p) || 0);
      return {
        major: parts[0] || 1,
        minor: parts[1] || 0,
        patch: parts[2] || 0
      };
    }

    // Check URL path: /api/v2/users
    const pathMatch = req.path.match(/^\/api\/v(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (pathMatch) {
      return {
        major: parseInt(pathMatch[1]) || 1,
        minor: parseInt(pathMatch[2]) || 0,
        patch: parseInt(pathMatch[3]) || 0
      };
    }

    return null;
  }

  // Express middleware for version handling
  versionMiddleware() {
    return (req: any, res: any, next: any) => {
      const requestedVersion = this.parseVersionFromRequest(req);
      const cleanPath = this.cleanPath(req.path);
             const endpoint = this.getHandler(cleanPath, requestedVersion || undefined);

      if (!endpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
          path: cleanPath,
          requestedVersion: requestedVersion || this.defaultVersion
        });
      }

      // Check if version is deprecated
      if (endpoint.deprecated) {
        res.setHeader('X-API-Deprecated', 'true');
        if (endpoint.deprecationDate) {
          res.setHeader('X-API-Deprecation-Date', endpoint.deprecationDate.toISOString());
        }
        if (endpoint.sunsetDate) {
          res.setHeader('X-API-Sunset-Date', endpoint.sunsetDate.toISOString());
        }
      }

      // Check if version is past sunset date
      if (endpoint.sunsetDate && new Date() > endpoint.sunsetDate) {
        return res.status(410).json({
          error: 'API version no longer supported',
          version: endpoint.version,
          sunsetDate: endpoint.sunsetDate
        });
      }

      // Add version info to response headers
      res.setHeader('X-API-Version', this.getVersionKey(endpoint.version));
      res.setHeader('X-API-Latest-Version', this.getLatestVersion(cleanPath));

      // Attach endpoint info to request
      req.apiVersion = endpoint.version;
      req.apiEndpoint = endpoint;

      next();
    };
  }

  // Get all available versions for a path
  getAvailableVersions(path: string): ApiVersion[] {
    const pathEndpoints = this.endpoints.get(path);
    if (!pathEndpoints) {
      return [];
    }

    return pathEndpoints.map(e => e.version);
  }

  // Get latest version for a path
  getLatestVersion(path: string): string {
    const pathEndpoints = this.endpoints.get(path);
    if (!pathEndpoints || pathEndpoints.length === 0) {
      return this.getVersionKey(this.defaultVersion);
    }

    return this.getVersionKey(pathEndpoints[0].version);
  }

  // Mark version as deprecated
  deprecateVersion(path: string, version: ApiVersion, sunsetDate?: Date): void {
    const pathEndpoints = this.endpoints.get(path);
    if (!pathEndpoints) {
      return;
    }

    const endpoint = pathEndpoints.find(e => 
      this.compareVersions(e.version, version) === 0
    );

    if (endpoint) {
      endpoint.deprecated = true;
      endpoint.deprecationDate = new Date();
      endpoint.sunsetDate = sunsetDate;
      
      console.log(`⚠️  Deprecated API endpoint: ${path} v${this.getVersionKey(version)}`);
    }
  }

  // Get deprecation info
  getDeprecationInfo(): Array<{
    path: string;
    version: ApiVersion;
    deprecationDate?: Date;
    sunsetDate?: Date;
  }> {
    const deprecated: Array<{
      path: string;
      version: ApiVersion;
      deprecationDate?: Date;
      sunsetDate?: Date;
    }> = [];

    for (const [path, endpoints] of this.endpoints.entries()) {
      for (const endpoint of endpoints) {
        if (endpoint.deprecated) {
          deprecated.push({
            path,
            version: endpoint.version,
            deprecationDate: endpoint.deprecationDate,
            sunsetDate: endpoint.sunsetDate
          });
        }
      }
    }

    return deprecated;
  }

  private compareVersions(a: ApiVersion, b: ApiVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  private getVersionKey(version: ApiVersion): string {
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  private cleanPath(path: string): string {
    // Remove version prefix from path
    return path.replace(/^\/api\/v\d+(?:\.\d+)?(?:\.\d+)?/, '');
  }
}

// Global version manager
export const apiVersionManager = new ApiVersionManager({ major: 1, minor: 0, patch: 0 });

// Utility functions for common versioning patterns
export function createVersionedRoute(
  router: any,
  method: string,
  path: string,
  versions: Array<{
    version: ApiVersion;
    handler: any;
    deprecated?: boolean;
    sunsetDate?: Date;
  }>
): void {
  for (const versionConfig of versions) {
    apiVersionManager.registerEndpoint(
      path,
      versionConfig.version,
      versionConfig.handler,
      {
        deprecated: versionConfig.deprecated,
        sunsetDate: versionConfig.sunsetDate
      }
    );

    // Register route with version prefix
    const versionedPath = `/v${versionConfig.version.major}${path}`;
    router[method.toLowerCase()](versionedPath, versionConfig.handler);
  }
}

// Middleware for automatic version detection and routing
export function versionedRouter() {
  return apiVersionManager.versionMiddleware();
}

// Response transformer for version compatibility
export function transformResponse(data: any, fromVersion: ApiVersion, toVersion: ApiVersion): any {
  // Implement version-specific transformations here
  // This is where you'd handle breaking changes between versions
  
  if (fromVersion.major !== toVersion.major) {
    // Handle major version differences
    console.log(`🔄 Transforming response from v${fromVersion.major} to v${toVersion.major}`);
  }

  return data;
} 
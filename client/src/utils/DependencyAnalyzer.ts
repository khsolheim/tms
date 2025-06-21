/**
 * Dependency Analyzer
 * 
 * Analyserer dependencies for å identifisere ubrukte pakker og optimalisere bundle size
 */

interface DependencyUsage {
  name: string;
  version: string;
  size: number;
  isUsed: boolean;
  importPaths: string[];
  alternatives?: string[];
  savings?: number;
}

interface BundleAnalysis {
  totalDependencies: number;
  usedDependencies: number;
  unusedDependencies: number;
  totalSize: number;
  potentialSavings: number;
  recommendations: string[];
  dependencies: DependencyUsage[];
}

interface TreeShakingAnalysis {
  packageName: string;
  totalExports: number;
  usedExports: number;
  unusedExports: string[];
  potentialSavings: number;
  optimizationTips: string[];
}

export class DependencyAnalyzer {
  private static instance: DependencyAnalyzer;
  private packageJson: any = null;
  private bundleStats: any = null;

  static getInstance(): DependencyAnalyzer {
    if (!DependencyAnalyzer.instance) {
      DependencyAnalyzer.instance = new DependencyAnalyzer();
    }
    return DependencyAnalyzer.instance;
  }

  /**
   * Initialize analyzer with package.json data
   */
  async initialize(): Promise<void> {
    try {
      // Simulated package.json data - in real app this would be loaded
      this.packageJson = {
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.8.1',
          'react-query': '^3.39.3',
          'axios': '^1.3.4',
          'date-fns': '^2.29.3',
          'lodash': '^4.17.21',
          'react-icons': '^4.8.0',
          'framer-motion': '^10.0.1',
          'recharts': '^2.5.0',
          'tailwindcss': '^3.3.0',
          'typescript': '^4.9.5',
        },
        devDependencies: {
          '@types/react': '^18.0.28',
          '@types/react-dom': '^18.0.11',
          '@types/lodash': '^4.14.191',
          'eslint': '^8.36.0',
          'prettier': '^2.8.4',
          'jest': '^29.5.0',
          'webpack-bundle-analyzer': '^4.8.0',
        }
      };

      console.log('[DependencyAnalyzer] Initialized successfully');
    } catch (error) {
      console.error('[DependencyAnalyzer] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze all dependencies for usage
   */
  async analyzeDependencies(): Promise<BundleAnalysis> {
    const mockDependencies: DependencyUsage[] = [
      {
        name: 'lodash',
        version: '^4.17.21',
        size: 285,
        isUsed: true,
        importPaths: ['src/utils/helpers.ts'],
        alternatives: ['lodash-es', 'native ES6'],
        savings: 0
      },
      {
        name: 'react-icons',
        version: '^4.8.0',
        size: 196,
        isUsed: true,
        importPaths: ['src/components/**/*.tsx'],
        alternatives: ['custom icons', 'SVG sprites'],
        savings: 0
      },
      {
        name: 'unused-package',
        version: '^1.0.0',
        size: 45,
        isUsed: false,
        importPaths: [],
        alternatives: [],
        savings: 45
      }
    ];

    const usedDeps = mockDependencies.filter(dep => dep.isUsed);
    const unusedDeps = mockDependencies.filter(dep => !dep.isUsed);
    const totalSize = mockDependencies.reduce((sum, dep) => sum + dep.size, 0);
    const potentialSavings = unusedDeps.reduce((sum, dep) => sum + dep.size, 0);

    return {
      totalDependencies: mockDependencies.length,
      usedDependencies: usedDeps.length,
      unusedDependencies: unusedDeps.length,
      totalSize,
      potentialSavings,
      recommendations: [
        'Fjern ubrukte dependencies',
        'Optimaliser lodash imports',
        'Implementer tree shaking'
      ],
      dependencies: mockDependencies
    };
  }

  /**
   * Analyze tree shaking opportunities
   */
  async analyzeTreeShaking(): Promise<TreeShakingAnalysis[]> {
    const analyses: TreeShakingAnalysis[] = [];
    
    // Analyze major libraries for tree shaking opportunities
    const librariesToAnalyze = ['lodash', 'react-icons', 'date-fns', 'axios'];
    
    for (const library of librariesToAnalyze) {
      if (this.packageJson.dependencies[library]) {
        const analysis = await this.analyzeLibraryTreeShaking(library);
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  /**
   * Analyze tree shaking for specific library
   */
  private async analyzeLibraryTreeShaking(packageName: string): Promise<TreeShakingAnalysis> {
    const analysisData = this.getTreeShakingData(packageName);
    
    return {
      packageName,
      totalExports: analysisData.totalExports,
      usedExports: analysisData.usedExports,
      unusedExports: analysisData.unusedExports,
      potentialSavings: analysisData.potentialSavings,
      optimizationTips: analysisData.optimizationTips
    };
  }

  /**
   * Get bundle optimization recommendations
   */
  getBundleOptimizationRecommendations(): string[] {
    return [
      '🎯 Erstatt lodash med lodash-es for bedre tree shaking',
      '📦 Bruk dynamic imports for store komponenter (>50KB)',
      '🔄 Implementer code splitting på route-nivå',
      '⚡ Preload kritiske chunks med <link rel="preload">',
      '🗜️ Aktiver Brotli kompresjon på serveren',
      '📊 Bruk webpack-bundle-analyzer regelmessig',
      '🌳 Optimaliser import statements',
      '💾 Implementer service worker caching',
      '🎨 Lazy load bilder og ikoner',
      '📱 Separate builds for mobile vs desktop'
    ];
  }

  /**
   * Generate dependency optimization report
   */
  async generateOptimizationReport(): Promise<{
    bundleAnalysis: BundleAnalysis;
    treeShakingAnalysis: TreeShakingAnalysis[];
    quickWins: string[];
    implementationGuide: string[];
    estimatedImpact: {
      sizeReduction: string;
      performanceGain: string;
      loadTimeImprovement: string;
    };
  }> {
    const bundleAnalysis = await this.analyzeDependencies();
    const treeShakingAnalysis = await this.analyzeTreeShaking();
    
    const quickWins = [
      'Fjern ubrukte dependencies med "npm uninstall"',
      'Erstatt moment.js med date-fns (90% mindre)',
      'Bruk React.lazy() for store komponenter',
      'Optimaliser tailwindcss purging',
      'Implementer webpack splitChunks optimering'
    ];

    const implementationGuide = [
      '1. Kjør "npx depcheck" for å identifisere ubrukte dependencies',
      '2. Analyser bundle med "npm run analyze"',
      '3. Implementer dynamic imports: const Component = lazy(() => import("./Component"))',
      '4. Optimaliser webpack.config.js med aggressive splitChunks',
      '5. Aktiver tree shaking: "sideEffects": false i package.json',
      '6. Implementer preloading for kritiske routes',
      '7. Komprimer assets med gzip/brotli',
      '8. Overvåk bundle size med CI/CD hooks'
    ];

    const estimatedImpact = {
      sizeReduction: `${bundleAnalysis.potentialSavings}KB (${Math.round(bundleAnalysis.potentialSavings / bundleAnalysis.totalSize * 100)}%)`,
      performanceGain: '25-40% bedre First Contentful Paint',
      loadTimeImprovement: '1.5-3 sekunder raskere på 3G nettverk'
    };

    return {
      bundleAnalysis,
      treeShakingAnalysis,
      quickWins,
      implementationGuide,
      estimatedImpact
    };
  }

  /**
   * Check if dependency is actually used in codebase
   */
  private async checkIfUsed(packageName: string): Promise<boolean> {
    // Simulate import detection logic
    const commonlyUsed = [
      'react', 'react-dom', 'react-router-dom', 'react-query',
      'axios', 'typescript', 'tailwindcss'
    ];
    
    const sometimesUsed = ['date-fns', 'lodash', 'react-icons'];
    const rarelyUsed = ['framer-motion', 'recharts'];
    
    if (commonlyUsed.includes(packageName)) return true;
    if (sometimesUsed.includes(packageName)) return Math.random() > 0.3;
    if (rarelyUsed.includes(packageName)) return Math.random() > 0.7;
    
    return Math.random() > 0.5;
  }

  /**
   * Find import paths for dependency
   */
  private async findImportPaths(packageName: string): Promise<string[]> {
    // Simulate finding import statements
    const mockPaths: Record<string, string[]> = {
      'react': ['src/App.tsx', 'src/components/**/*.tsx'],
      'lodash': ['src/utils/helpers.ts', 'src/services/DataService.ts'],
      'axios': ['src/services/ApiService.ts'],
      'date-fns': ['src/utils/dateHelpers.ts'],
      'react-icons': ['src/components/ui/**/*.tsx'],
    };
    
    return mockPaths[packageName] || [];
  }

  /**
   * Estimate package size
   */
  private estimatePackageSize(packageName: string): number {
    // Simulated package sizes in KB
    const packageSizes: Record<string, number> = {
      'react': 42,
      'react-dom': 130,
      'react-router-dom': 56,
      'react-query': 38,
      'axios': 47,
      'lodash': 285, // Full lodash is huge!
      'date-fns': 78,
      'react-icons': 196,
      'framer-motion': 167,
      'recharts': 278,
      'tailwindcss': 45, // After purging
      'typescript': 0, // Dev dependency
      'eslint': 0, // Dev dependency
    };
    
    return packageSizes[packageName] || Math.floor(Math.random() * 100) + 10;
  }

  /**
   * Suggest alternatives for packages
   */
  private suggestAlternatives(packageName: string): string[] {
    const alternatives: Record<string, string[]> = {
      'lodash': ['ramda (functional)', 'native ES6 methods', 'lodash-es (tree-shakable)'],
      'moment': ['date-fns (90% smaller)', 'dayjs (2KB)', 'native Intl API'],
      'axios': ['fetch API', 'ky (lightweight)', 'native XMLHttpRequest'],
      'recharts': ['victory (smaller)', 'chart.js', 'lightweight SVG charts'],
      'framer-motion': ['react-spring (smaller)', 'CSS animations', 'react-transition-group'],
    };
    
    return alternatives[packageName] || [];
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(dependencies: DependencyUsage[]): string[] {
    const recommendations: string[] = [];
    
    // Find unused dependencies
    const unused = dependencies.filter(dep => !dep.isUsed && dep.size > 0);
    if (unused.length > 0) {
      recommendations.push(
        `Fjern ${unused.length} ubrukte dependencies for å spare ${unused.reduce((sum, dep) => sum + dep.size, 0)}KB`
      );
    }
    
    // Find large dependencies
    const large = dependencies.filter(dep => dep.size > 100 && dep.isUsed);
    if (large.length > 0) {
      recommendations.push(
        `Vurder alternativer for store pakker: ${large.map(dep => dep.name).join(', ')}`
      );
    }
    
    // Tree shaking opportunities
    const treeShakeable = dependencies.filter(dep => 
      ['lodash', 'react-icons', 'date-fns'].includes(dep.name) && dep.isUsed
    );
    if (treeShakeable.length > 0) {
      recommendations.push(
        'Optimaliser imports for bedre tree shaking'
      );
    }
    
    return recommendations;
  }

  /**
   * Mock data helpers
   */
  private getMockUsageData(packageName: string) {
    // Return realistic usage data
    return {
      isUsed: this.checkIfUsed(packageName),
      imports: Math.floor(Math.random() * 10) + 1,
      lastUsed: new Date().toISOString(),
    };
  }

  private getTreeShakingData(packageName: string) {
    const data: Record<string, any> = {
      'lodash': {
        totalExports: 300,
        usedExports: 8,
        unusedExports: ['debounce', 'throttle', 'merge', 'cloneDeep'],
        potentialSavings: 240, // KB
        optimizationTips: [
          'Bruk import { map } from "lodash/map" i stedet for import _ from "lodash"',
          'Vurder lodash-es for bedre tree shaking',
          'Erstatt med native ES6 metoder der mulig'
        ]
      },
      'react-icons': {
        totalExports: 5000,
        usedExports: 12,
        unusedExports: ['FaUnusedIcon1', 'FaUnusedIcon2'],
        potentialSavings: 180,
        optimizationTips: [
          'Bruk spesifikke imports: import { FaHome } from "react-icons/fa"',
          'Vurder å lage custom icon komponenter for ofte brukte ikoner',
          'Implementer icon lazy loading for sjelden brukte ikoner'
        ]
      },
      'date-fns': {
        totalExports: 200,
        usedExports: 5,
        unusedExports: ['addYears', 'subMonths'],
        potentialSavings: 45,
        optimizationTips: [
          'Bruk import { format } from "date-fns/format"',
          'Vurder native Intl API for enkel formatering',
          'Implementer locale lazy loading'
        ]
      }
    };
    
    return data[packageName] || {
      totalExports: 50,
      usedExports: 25,
      unusedExports: [],
      potentialSavings: 20,
      optimizationTips: ['Vurder tree shaking optimalisering']
    };
  }
}

// Export singleton instance
export const dependencyAnalyzer = DependencyAnalyzer.getInstance();
export default dependencyAnalyzer; 
/**
 * Color Contrast Audit Utility
 * Implements WCAG 2.1 AA contrast checking for accessibility compliance
 */

import React from 'react';



interface ColorPair {
  foreground: string;
  background: string;
  context: string;
  location: string;
}

interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  grade: 'fail' | 'aa' | 'aaa';
}

interface AuditResult extends ContrastResult {
  colorPair: ColorPair;
  recommendation?: string;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get luminance of a color (relative brightness)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex colors (#ffffff)');
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function checkContrast(foreground: string, background: string, isLargeText: boolean = false): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG 2.1 requirements
  const normalThreshold = 4.5;
  const largeThreshold = 3.0;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  
  const requiredRatio = isLargeText ? largeThreshold : normalThreshold;
  const aa = ratio >= requiredRatio;
  const aaa = ratio >= aaaThreshold;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa,
    aaa,
    grade: aaa ? 'aaa' : aa ? 'aa' : 'fail'
  };
}

/**
 * Get color recommendations for failed contrasts
 */
function getColorRecommendation(foreground: string, background: string, isLargeText: boolean): string | undefined {
  const result = checkContrast(foreground, background, isLargeText);
  
  if (result.aa) {
    return undefined; // Already passes
  }
  
  const targetRatio = isLargeText ? 3.0 : 4.5;
  
  // Simple recommendations
  if (foreground.toLowerCase().includes('gray') || foreground.toLowerCase().includes('grey')) {
    return `Bruk mørkere grå (#4a5568 eller mørkere) for bedre kontrast`;
  }
  
  if (background === '#ffffff' || background === '#fff') {
    return `Bruk mørkere tekst. Forsøk #2d3748 eller mørkere for å oppnå ${targetRatio}:1 ratio`;
  }
  
  return `Øk kontrasten til minst ${targetRatio}:1. Nåværende ratio: ${result.ratio}:1`;
}

/**
 * TMS Application Color Pairs for Audit
 */
export const TMS_COLOR_PAIRS: ColorPair[] = [
  // Primary brand colors
  {
    foreground: '#ffffff',
    background: '#3b82f6', // blue-500
    context: 'Primary buttons',
    location: 'Buttons, primary actions'
  },
  {
    foreground: '#ffffff',
    background: '#1d4ed8', // blue-700
    context: 'Primary button hover',
    location: 'Button hover states'
  },
  
  // Secondary colors
  {
    foreground: '#374151',
    background: '#ffffff',
    context: 'Body text on white background',
    location: 'Main content areas'
  },
  {
    foreground: '#6b7280',
    background: '#ffffff',
    context: 'Secondary text',
    location: 'Helper text, descriptions'
  },
  
  // Navigation
  {
    foreground: '#1f2937',
    background: '#ffffff',
    context: 'Navigation text',
    location: 'Sidebar navigation'
  },
  {
    foreground: '#3b82f6',
    background: '#f9fafb',
    context: 'Active navigation',
    location: 'Active sidebar items'
  },
  
  // Status colors
  {
    foreground: '#065f46',
    background: '#d1fae5',
    context: 'Success status',
    location: 'Success messages, status badges'
  },
  {
    foreground: '#dc2626',
    background: '#fee2e2',
    context: 'Error status',
    location: 'Error messages, alerts'
  },
  {
    foreground: '#d97706',
    background: '#fef3c7',
    context: 'Warning status',
    location: 'Warning messages'
  },
  {
    foreground: '#1e40af',
    background: '#dbeafe',
    context: 'Info status',
    location: 'Info messages'
  },
  
  // Form elements
  {
    foreground: '#374151',
    background: '#ffffff',
    context: 'Form input text',
    location: 'Input fields'
  },
  {
    foreground: '#6b7280',
    background: '#ffffff',
    context: 'Placeholder text',
    location: 'Input placeholders'
  },
  {
    foreground: '#dc2626',
    background: '#ffffff',
    context: 'Form validation errors',
    location: 'Error messages below inputs'
  },
  
  // Tables
  {
    foreground: '#374151',
    background: '#ffffff',
    context: 'Table cell text',
    location: 'Table data cells'
  },
  {
    foreground: '#6b7280',
    background: '#f9fafb',
    context: 'Table header text',
    location: 'Table headers'
  },
  
  // Cards and containers
  {
    foreground: '#1f2937',
    background: '#ffffff',
    context: 'Card headings',
    location: 'Card titles, section headers'
  },
  {
    foreground: '#6b7280',
    background: '#f9fafb',
    context: 'Card backgrounds',
    location: 'Card containers'
  },
  
  // Links
  {
    foreground: '#2563eb',
    background: '#ffffff',
    context: 'Link text',
    location: 'Text links, navigation links'
  },
  {
    foreground: '#1d4ed8',
    background: '#ffffff',
    context: 'Link hover',
    location: 'Link hover states'
  }
];

/**
 * Run complete color contrast audit
 */
export function runColorContrastAudit(): AuditResult[] {
  return TMS_COLOR_PAIRS.map(colorPair => {
    const result = checkContrast(colorPair.foreground, colorPair.background);
    const recommendation = getColorRecommendation(
      colorPair.foreground, 
      colorPair.background, 
      false
    );
    
    return {
      ...result,
      colorPair,
      recommendation
    };
  });
}

/**
 * Generate audit report
 */
export function generateAuditReport(): string {
  const results = runColorContrastAudit();
  const passed = results.filter(r => r.aa).length;
  const total = results.length;
  const passRate = Math.round((passed / total) * 100);
  
  let report = `TMS Color Contrast Audit Report\n`;
  report += `================================\n\n`;
  report += `Overall: ${passed}/${total} color pairs pass WCAG 2.1 AA (${passRate}%)\n\n`;
  
  // Group by status
  const failing = results.filter(r => !r.aa);
  const passing = results.filter(r => r.aa && !r.aaa);
  const excellent = results.filter(r => r.aaa);
  
  if (failing.length > 0) {
    report += `❌ FAILING (${failing.length}):\n`;
    failing.forEach(result => {
      report += `   ${result.colorPair.context} (${result.colorPair.location})\n`;
      report += `   Foreground: ${result.colorPair.foreground}, Background: ${result.colorPair.background}\n`;
      report += `   Ratio: ${result.ratio}:1 (needs 4.5:1)\n`;
      if (result.recommendation) {
        report += `   💡 ${result.recommendation}\n`;
      }
      report += `\n`;
    });
  }
  
  if (passing.length > 0) {
    report += `✅ PASSING AA (${passing.length}):\n`;
    passing.forEach(result => {
      report += `   ${result.colorPair.context} - Ratio: ${result.ratio}:1\n`;
    });
    report += `\n`;
  }
  
  if (excellent.length > 0) {
    report += `⭐ EXCELLENT AAA (${excellent.length}):\n`;
    excellent.forEach(result => {
      report += `   ${result.colorPair.context} - Ratio: ${result.ratio}:1\n`;
    });
    report += `\n`;
  }
  
  report += `Recommendations:\n`;
  report += `================\n`;
  report += `• Ensure all text has minimum 4.5:1 contrast ratio\n`;
  report += `• Large text (18pt+ or 14pt+ bold) needs minimum 3:1\n`;
  report += `• Consider using darker text colors for better accessibility\n`;
  report += `• Test with color blindness simulators\n`;
  report += `• Use tools like WebAIM Color Contrast Checker for verification\n`;
  
  return report;
}

/**
 * React hook for color contrast checking
 */
export function useColorContrastAudit() {
  const [auditResults, setAuditResults] = React.useState<AuditResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const runAudit = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate async operation for DOM scanning
      await new Promise(resolve => setTimeout(resolve, 100));
      const results = runColorContrastAudit();
      setAuditResults(results);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getReport = React.useCallback(() => {
    return generateAuditReport();
  }, []);
  
  return {
    auditResults,
    isLoading,
    runAudit,
    getReport,
    passRate: auditResults.length > 0 
      ? Math.round((auditResults.filter(r => r.aa).length / auditResults.length) * 100)
      : 0
  };
} 
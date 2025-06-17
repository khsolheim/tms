export declare class QuantumCoherenceMonitor {
    getCoherenceMetrics(): Promise<{
        overallCoherence: number;
        decoherenceRate: number;
        coherenceTime: number;
        environmentalFactors: string[];
    }>;
    monitorCoherence(systemId: string): Promise<{
        systemId: string;
        coherence: number;
        status: string;
        timestamp: string;
    }>;
    optimizeCoherence(parameters: any): Promise<{
        optimized: boolean;
        newCoherence: number;
        parameters: any;
        improvement: number;
    }>;
}
//# sourceMappingURL=QuantumCoherenceMonitor.d.ts.map
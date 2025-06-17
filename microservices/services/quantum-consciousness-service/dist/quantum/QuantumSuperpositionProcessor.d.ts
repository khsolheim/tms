export declare class QuantumSuperpositionProcessor {
    getSuperpositionStates(systemId: string): Promise<{
        systemId: string;
        states: string[];
        amplitudes: number[];
    }>;
    createSuperposition(initialStates: any[], coefficients: any[]): Promise<{
        superpositionState: string;
        initialStates: any[];
        coefficients: any[];
        coherenceTime: number;
    }>;
    measureSuperposition(systemId: string, basis: string): Promise<{
        result: string;
        probability: number;
        basis: string;
        systemId: string;
    }>;
}
//# sourceMappingURL=QuantumSuperpositionProcessor.d.ts.map
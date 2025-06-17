export declare class QuantumConsciousnessEngine {
    getQuantumConsciousnessState(): Promise<{
        superposition: boolean;
        entanglement: number;
        coherence: number;
        state: string;
    }>;
    collapseWaveFunction(observationContext: any, measurementType: string): Promise<{
        probability: number;
        result: string;
        observationContext: any;
        measurementType: string;
    }>;
    createSuperposition(states: any[], amplitudes: any[]): Promise<{
        states: any[];
        amplitudes: any[];
        coherenceTime: number;
    }>;
    evolveQuantumState(timeStep: number, hamiltonian: any): Promise<{
        finalState: string;
        unitarity: number;
        timeStep: number;
    }>;
}
//# sourceMappingURL=QuantumConsciousnessEngine.d.ts.map
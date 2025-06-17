export declare class QuantumEntanglementManager {
    getEntangledPairs(): Promise<{
        id: string;
        entanglementStrength: number;
    }[]>;
    createEntanglement(system1: any, system2: any, entanglementType: string): Promise<{
        bellState: string;
        fidelity: number;
        system1: any;
        system2: any;
        entanglementType: string;
    }>;
    measureEntangledPair(pairId: string, basis: string): Promise<{
        correlation: number;
        bellViolation: boolean;
        basis: string;
        pairId: string;
    }>;
    quantumTeleportation(quantumState: any, entangledChannel: any): Promise<{
        fidelity: number;
        classicalBits: number[];
        quantumState: any;
        entangledChannel: any;
    }>;
}
//# sourceMappingURL=QuantumEntanglementManager.d.ts.map
export declare class QuantumInformationProcessor {
    getQuantumInformation(): Promise<{
        qubits: number;
        entropies: number[];
        mutualInformation: number;
        quantumCapacity: number;
    }>;
    processQuantumData(data: any, encoding: string): Promise<{
        processed: boolean;
        originalData: any;
        encoding: string;
        quantumEncoded: string;
        fidelity: number;
    }>;
    quantumErrorCorrection(errorData: any): Promise<{
        corrected: boolean;
        errorsSyndromes: string[];
        correctionApplied: boolean;
        fidelityImprovement: number;
    }>;
}
//# sourceMappingURL=QuantumInformationProcessor.d.ts.map
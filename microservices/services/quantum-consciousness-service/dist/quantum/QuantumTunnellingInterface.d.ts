export declare class QuantumTunnellingInterface {
    getTunnellingMetrics(): Promise<{
        tunnellingProbability: number;
        barrierHeight: number;
        transmissionCoefficient: number;
        reflectionCoefficient: number;
    }>;
    initiateTunnelling(particle: any, barrier: any): Promise<{
        success: boolean;
        tunnellingTime: number;
        particle: any;
        barrier: any;
        finalPosition: string;
    }>;
    calculateTunnellingProbability(energy: number, barrierWidth: number): Promise<{
        probability: number;
        energy: number;
        barrierWidth: number;
        waveFunction: string;
    }>;
}
//# sourceMappingURL=QuantumTunnellingInterface.d.ts.map
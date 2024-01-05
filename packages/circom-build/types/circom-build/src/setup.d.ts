export declare enum SnarkScheme {
    Groth16 = 0,
    Plonk = 1,
    FFlonk = 2
}
export declare class SnarkJSSetup {
    r1cs: string;
    constructor(r1cs: string);
    get zkey_path(): string;
    phase1(scheme: SnarkScheme, ptau: string): Promise<Uint8Array>;
}

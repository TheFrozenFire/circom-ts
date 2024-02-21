import { SnarkScheme, FixedLengthArray } from "@frozenfire/circom-common";
export type R1CSCoefficient = {
    [key: number]: bigint;
};
export type R1CSConstraint = FixedLengthArray<[R1CSCoefficient, R1CSCoefficient, R1CSCoefficient]>;
export type R1CSDetails = {
    n8: number;
    prime: bigint;
    nVars: number;
    nOutputs: number;
    nPubInputs: number;
    nPrvInputs: number;
    nLabels: number;
    nConstraints: number;
    useCustomGates: boolean;
    constraints: R1CSConstraint[];
    customGates: unknown;
    customGatesUses: unknown;
    map: number[];
};
export declare class SnarkJSSetup {
    r1cs: string;
    constructor(r1cs: string);
    get zkey_path(): string;
    get r1cs_details(): Promise<R1CSDetails>;
    phase1(scheme: SnarkScheme, ptau: string): Promise<Uint8Array>;
}

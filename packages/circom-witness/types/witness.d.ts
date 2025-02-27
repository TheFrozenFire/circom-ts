import { WasmWrapper } from "./wasm.js";
import { Symbol, SymbolMap } from "./symbols.js";
export type WitnessInputs = {
    [signalName: string]: Array<bigint>;
};
export type WitnessSignal = Symbol & {
    value: bigint;
};
export declare class WitnessCalculator {
    protected instance: WasmWrapper;
    constructor(instance: WasmWrapper);
    static flattenInputs(inputs: object): WitnessInputs;
    init(sanityCheck?: boolean): Promise<void>;
    calculate(inputs: WitnessInputs, sanityCheck?: boolean): Promise<void>;
    get memory(): WebAssembly.Memory;
    get witness(): bigint[];
    get witnessBin(): Uint8Array;
    witnessAt(index: number): bigint;
    writeInputs(inputs: WitnessInputs): void;
}
export declare class WitnessAccessor {
    protected witness: WitnessCalculator;
    protected symbols: SymbolMap;
    constructor(witness: WitnessCalculator, symbols: SymbolMap);
    toArray(): bigint[];
    toBin(): Uint8Array;
    varIndex(name: string): number;
    varMatch(pattern: string | RegExp): string[];
    value(name: string): bigint;
    map(name: string): WitnessSignal[];
    array(name: string): bigint[];
    match(pattern: string | RegExp): bigint[];
}
export declare class Witness {
    protected code: Uint8Array | Promise<Uint8Array>;
    protected symbols: SymbolMap;
    protected logger?: (message: string[]) => void;
    protected calculator: WitnessCalculator;
    protected accessor: WitnessAccessor;
    constructor(code: Uint8Array | Promise<Uint8Array>, symbols: SymbolMap, logger?: (message: string[]) => void);
    init(sanityCheck?: boolean): Promise<void>;
    get memory(): WebAssembly.Memory;
    calculate(inputs: object, sanityCheck?: boolean): Promise<WitnessAccessor>;
}

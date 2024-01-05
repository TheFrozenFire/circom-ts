export declare const ERROR_MESSAGES: Readonly<{
    1: "Signal not found";
    2: "Too many signals";
    3: "Signal already set";
    4: "Assert Failed";
    5: "Not enough memory";
    6: "Input signal array access exceeds the size";
}>;
export type CircomWasmInstance = WebAssembly.Instance & {
    exports: WebAssembly.Exports & {
        memory: WebAssembly.Memory;
        getVersion: () => number;
        getMinorVersion: () => number;
        getPatchVersion: () => number;
        getSharedRWMemoryStart: () => number;
        readSharedRWMemory: (index: number) => number;
        writeSharedRWMemory: (index: number, value: number) => void;
        init: (boolean: any) => void;
        setInputSignal: (signal: number, index: number, value: number) => void;
        getInputSignalSize: () => number;
        getRawPrime: () => BigInt;
        getFieldNumLen32: () => number;
        getWitnessSize: () => number;
        getInputSize: () => number;
        getWitness: (index: number) => number;
        getMessageChar: () => number;
    };
};
export declare class WasmWrapper {
    protected code: Uint8Array | Promise<Uint8Array>;
    protected memory?: WebAssembly.Memory;
    protected logger: (message: string[]) => void;
    protected instance: CircomWasmInstance;
    protected errorAccumulator: string[];
    protected messageAccumulator: string[];
    protected fieldElementUint32Size: number;
    constructor(code: Uint8Array | Promise<Uint8Array>, memory?: WebAssembly.Memory, logger?: (message: string[]) => void);
    static signalNameHash(name: string): [number, number];
    init(sanityCheck?: boolean): Promise<void>;
    get runtime(): {
        exceptionHandler: any;
        printErrorMessage: any;
        writeBufferMessage: any;
        showSharedRWMemory: any;
    };
    get version(): number;
    get minorVersion(): number;
    get patchVersion(): number;
    get prime(): BigInt;
    get witnessSize(): number;
    get inputSize(): number;
    get witness(): bigint[];
    witnessAt(index: number): bigint;
    readFieldElement(): bigint;
    writeFieldElement(value: bigint): void;
    writeSignal(name: string, index: number, value: bigint): void;
    exceptionHandler(code: any): void;
    printErrorMessage(): void;
    writeBufferMessage(): void;
    showSharedRWMemory(): void;
    protected retrieveMessage(): string;
    protected retrieveStringFromPointer(pointer: number): string;
}

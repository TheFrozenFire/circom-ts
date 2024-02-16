export type Symbol = {
    name: string;
    labelIndex: number;
    varIndex: number;
    componentIndex: number;
};
export type SymbolMap = {
    [name: string]: Symbol;
};
export declare class SymbolReader {
    protected source: string | string[];
    constructor(source: string | string[]);
    readSymbols(): Generator<Symbol>;
    readSymbolMap(): SymbolMap;
}

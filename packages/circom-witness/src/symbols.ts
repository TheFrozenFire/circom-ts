export type Symbol = {
    name: string,
    labelIndex: number,
    varIndex: number,
    componentIndex: number
}

export type SymbolMap = {
    [name: string]: Symbol
}

export class SymbolReader {
    constructor(
        protected source: string | string[]
    ) {}

    *readSymbols(): Generator<Symbol> {
        for (const line of (Array.isArray(this.source) ? this.source : this.source.split("\n")) ) {
            const [labelIndex, varIndex, componentIndex, name] = line.split(",")
            yield {
                name,
                labelIndex: parseInt(labelIndex),
                varIndex: parseInt(varIndex),
                componentIndex: parseInt(componentIndex)
            }
        }
    }

    readSymbolMap(): SymbolMap {
        const result: SymbolMap = {}
        for (const symbol of this.readSymbols()) {
            result[symbol.name] = symbol
        }

        return result
    }
}
export class SymbolReader {
    source;
    constructor(source) {
        this.source = source;
    }
    *readSymbols() {
        for (const line of this.source.split("\n")) {
            const [labelIndex, varIndex, componentIndex, name] = line.split(",");
            yield {
                name,
                labelIndex: parseInt(labelIndex),
                varIndex: parseInt(varIndex),
                componentIndex: parseInt(componentIndex)
            };
        }
    }
    readSymbolMap() {
        const result = {};
        for (const symbol of this.readSymbols()) {
            result[symbol.name] = symbol;
        }
        return result;
    }
}

import { WasmWrapper } from "./wasm.js";
import { SymbolReader } from "./symbols.js";
export class WitnessCalculator {
    instance;
    constructor(instance) {
        this.instance = instance;
    }
    static flattenInputs(inputs) {
        function flattenInput(input) {
            let result = [];
            if (input instanceof Array) {
                for (let i = 0; i < input.length; i++) {
                    result = result.concat(flattenInput(input[i]));
                }
            }
            else if (input instanceof Object) {
                for (let key in input) {
                    result = result.concat(flattenInput(input[key]));
                }
            }
            else {
                result.push(BigInt(input));
            }
            return result;
        }
        return Object.entries(inputs).reduce((result, input) => {
            return Object.assign(result, {
                [input[0]]: flattenInput(input[1])
            });
        }, {});
    }
    async calculate(inputs, sanityCheck = false) {
        await this.instance.init(sanityCheck);
        this.writeInputs(inputs);
    }
    get witness() {
        return this.instance.witness;
    }
    witnessAt(index) {
        return this.instance.witnessAt(index);
    }
    writeInputs(inputs) {
        let count = 0;
        const size = this.instance.inputSize;
        for (let signalName in inputs) {
            for (let i = 0; i < inputs[signalName].length; i++) {
                this.instance.writeSignal(signalName, i, inputs[signalName][i]);
                count++;
            }
        }
        if (count != size) {
            throw new Error(`Invalid number of inputs (${count} / ${size})`);
        }
    }
}
export class WitnessAccessor {
    witness;
    symbols;
    constructor(witness, symbols) {
        this.witness = witness;
        this.symbols = symbols;
    }
    varIndex(name) {
        return this.symbols[name].varIndex;
    }
    varMatch(pattern) {
        if (typeof pattern == "string") {
            pattern = RegExp(pattern.replaceAll("*", "\\w+").replaceAll(".", "\\."));
        }
        return Object.entries(this.symbols).filter(([index, symbol]) => index.match(pattern)).map(([index, symbol]) => index);
    }
    value(name) {
        return this.witness.witnessAt(this.varIndex(name));
    }
    map(name) {
        return Object.entries(this.symbols)
            .filter(([index, symbol]) => index.startsWith(name))
            .map(([index, symbol]) => Object.assign({}, symbol, {
            "value": this.witness.witnessAt(symbol.varIndex)
        }));
    }
    array(name) {
        return Object.entries(this.symbols)
            .filter(([index, symbol]) => index.startsWith(`${name}[`))
            .map(([index, symbol]) => this.witness.witnessAt(symbol.varIndex));
    }
    match(pattern) {
        return this.varMatch(pattern).map((symbol) => this.value(symbol));
    }
}
export class Witness {
    code;
    symbols;
    calculator;
    accessor;
    constructor(code, symbols) {
        this.code = code;
        this.symbols = symbols;
        this.calculator = new WitnessCalculator(new WasmWrapper(code));
        this.accessor = new WitnessAccessor(this.calculator, (new SymbolReader(symbols).readSymbolMap()));
    }
    async calculate(inputs, sanityCheck = false) {
        await this.calculator.calculate(WitnessCalculator.flattenInputs(inputs), sanityCheck);
        return this.accessor;
    }
}

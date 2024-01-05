import { WasmWrapper } from "./wasm.js"
import { Symbol, SymbolMap, SymbolReader } from "./symbols.js"

export type WitnessInputs = {
    [signalName: string]: Array<bigint>
}

export type WitnessSignal = Symbol & {
    value: bigint
}

export class WitnessCalculator {
    constructor(
        protected instance: WasmWrapper
    ) {}

    static flattenInputs(inputs: object): WitnessInputs {
        function flattenInput(input: any): bigint[] {
            let result = []
            if (input instanceof Array) {
                for (let i = 0; i < input.length; i++) {
                    result = result.concat(flattenInput(input[i]))
                }
            } else if (input instanceof Object) {
                for (let key in input) {
                    result = result.concat(flattenInput(input[key]))
                }
            } else {
                result.push(BigInt(input))
            }

            return result
        }

        return Object.entries(inputs).reduce((result, input) => {
            return Object.assign(result, {
                [input[0]]: flattenInput(input[1])
            })
        }, {})
    }

    async calculate(inputs: WitnessInputs, sanityCheck: boolean = false) {
        await this.instance.init(sanityCheck);

        this.writeInputs(inputs)
    }

    get witness(): bigint[] {
        return this.instance.witness
    }

    witnessAt(index: number): bigint {
        return this.instance.witnessAt(index)
    }

    writeInputs(inputs: WitnessInputs) {
        let count = 0;
        const size = this.instance.inputSize
        for (let signalName in inputs) {
            for (let i = 0; i < inputs[signalName].length; i++) {
                this.instance.writeSignal(signalName, i, inputs[signalName][i])
                count++
            }
        }

        if(count != size) {
            throw new Error(`Invalid number of inputs (${count} / ${size})`)
        }
    }
}

export class WitnessAccessor {
    constructor(
        protected witness: WitnessCalculator,
        protected symbols: SymbolMap,
    ) { }

    toArray() {
        return this.witness.witness
    }

    varIndex(name: string): number {
        return this.symbols[name].varIndex
    }

    varMatch(pattern: string | RegExp) {
        if(typeof pattern == "string") {
            pattern = RegExp(pattern.replaceAll("*", "\\w+").replaceAll(".", "\\."))
        }
        
        return Object.entries(this.symbols).filter(([index, symbol]) => index.match(pattern)).map(([index, symbol]) => index)
    }

    value(name: string): bigint {
        return this.witness.witnessAt(this.varIndex(name))
    }

    map(name: string): WitnessSignal[] {
        return Object.entries(this.symbols)
            .filter(([index, symbol]) => index.startsWith(name))
            .map(([index, symbol]) => Object.assign(
                {}, symbol,
                {
                    "value": this.witness.witnessAt(symbol.varIndex)
                }) as WitnessSignal
            )
    }

    array(name: string): bigint[] {
        return Object.entries(this.symbols)
        .filter(([index, symbol]) => index.startsWith(`${name}[`))
        .map(([index, symbol]) => this.witness.witnessAt(symbol.varIndex))
    }

    match(pattern: string | RegExp): bigint[] {
        return this.varMatch(pattern).map((symbol) => this.value(symbol))
    }
}

export class Witness {
    protected calculator: WitnessCalculator
    protected accessor: WitnessAccessor

    constructor(
        protected code:  Uint8Array | Promise<Uint8Array>,
        protected symbols: string
    ) {
        this.calculator = new WitnessCalculator(new WasmWrapper(code))
        this.accessor = new WitnessAccessor(this.calculator, (new SymbolReader(symbols).readSymbolMap()))
    }

    async calculate(inputs: object, sanityCheck: boolean = false) {
        await this.calculator.calculate(WitnessCalculator.flattenInputs(inputs), sanityCheck)

        return this.accessor
    }
}
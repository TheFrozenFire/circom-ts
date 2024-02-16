import { WasmWrapper } from "./wasm.js"
import { Symbol, SymbolMap } from "./symbols.js"

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

    get witnessBin(): Uint8Array {
        const n32 = this.instance.fieldElementUint32Size
        const n8 = n32 * 4
        const witnessBufferSize = (this.instance.witnessSize * n32) + n32 + 11

        const buff32 = new Uint32Array(witnessBufferSize)
        const buff = new Uint8Array(buff32.buffer)

        buff.set("wtns".split("").map((c) => c.charCodeAt(0)), 0)
        
        // version
        buff32[1] = 2
        // number of sections
        buff32[2] = 2

        // Section ID: 1
        buff32[3] = 1

        // Section size
        const idSection1Length = (8 + n8).toString(16)
        buff32[4] = parseInt(idSection1Length.slice(0, 8), 16)
        buff32[5] = parseInt(idSection1Length.slice(8, 16), 16)

        // n32
        buff32[6] = n8

        // prime
        const prime = this.instance.prime
        const primeHex = prime.toString(16).padStart(n8 * 2, "0");
        // reverse order
        for(let i = 0; i < n32; i++) {
            buff32[7 + n32 - i - 1] = parseInt(primeHex.slice(i * 8, (i + 1) * 8), 16)
        }

        buff32[7 + n32] = this.instance.witnessSize

        // Section ID: 2
        buff32[8 + n32] = 2

        // Section size
        const idSection2Length = (n8 * this.instance.witnessSize).toString(16)
        buff32[9 + n32] = parseInt(idSection2Length.slice(0, 8), 16)
        buff32[10 + n32] = parseInt(idSection2Length.slice(8, 16), 16)

        // witness
        for(let i = 0; i < this.instance.witnessSize; i++) {
            const witness = this.witnessAt(i).toString(16).padStart(n8 * 2, "0");
            // reverse order
            for(let j = 0; j < n32; j++) {
                buff32[11 + n32 + (i * n32) + n32 - j - 1] = parseInt(witness.slice(j * 8, (j + 1) * 8), 16)
            }
        }

        return buff
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

    toBin() {
        return this.witness.witnessBin
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
        return this.map(`${name}[`).map((signal) => signal.value)
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
        protected symbols: SymbolMap
    ) {
        this.calculator = new WitnessCalculator(new WasmWrapper(code))
        this.accessor = new WitnessAccessor(this.calculator, symbols)
    }

    async calculate(inputs: object, sanityCheck: boolean = false) {
        await this.calculator.calculate(WitnessCalculator.flattenInputs(inputs), sanityCheck)

        return this.accessor
    }
}
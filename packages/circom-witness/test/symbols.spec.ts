import { assert } from "chai";
import {
    WasmWrapper,
    WitnessCalculator,
    WitnessInputs,
    SymbolReader,
    WitnessAccessor } from "../src/index.js"

import { readFile } from "fs/promises"
import { createReadStream } from "fs"
import { createInterface } from "readline";

describe("Symbol Access", async () => {
    it("Read witness", async () => {
        const wasmFile = await readFile("test/fixture/test.wasm")
        const wasm = new WasmWrapper(wasmFile)

        await wasm.init()

        let symbolLines: string[] = []
        for await(const line of createInterface({ input: createReadStream("test/fixture/test.sym") })) {
            symbolLines.push(line)
        }
        const symbolReader = new SymbolReader(symbolLines)
        const symbols = await symbolReader.readSymbolMap()

        const calculator = new WitnessCalculator(wasm)
        await calculator.calculate(WitnessCalculator.flattenInputs({
            "in": 10,
            "inArray": [...Array(10).keys()],
        }))

        const accessor = new WitnessAccessor(calculator, symbols)

        assert.equal(accessor.value("main.out"), 100n)
        assert.deepEqual(accessor.array("main.outArray"), [...Array(10).keys()].map((i) => BigInt(i * i)))
    })
})
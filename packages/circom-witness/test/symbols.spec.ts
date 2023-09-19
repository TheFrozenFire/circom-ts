import { assert } from "chai";
import {
    WasmWrapper,
    WitnessCalculator,
    WitnessInputs,
    SymbolReader,
    WitnessAccessor } from "../src/index.js"

import { readFile } from "fs/promises"

describe("Symbol Access", async () => {
    it("Read witness", async () => {
        const wasmFile = await readFile("test/fixture/test.wasm")
        const wasm = new WasmWrapper(wasmFile)

        await wasm.init()

        const symbolFile = (await readFile("test/fixture/test.sym")).toString()
        const symbolReader = new SymbolReader(symbolFile)
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
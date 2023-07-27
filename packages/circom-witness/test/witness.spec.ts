import { assert } from "chai";
import { WasmWrapper, WitnessCalculator } from "../src/index.js"

import { readFile } from "fs/promises"

describe("Witness Execution", async () => {
    it("Read + write", async () => {
        const file = await readFile("test/fixture/test.wasm")
        const wasm = new WasmWrapper(file)

        await wasm.init()

        const calculator = new WitnessCalculator(wasm)
        calculator.calculate(WitnessCalculator.flattenInputs({
            "in": 10,
            "inArray": [...Array(10).keys()],
        }))
        
        assert.equal(calculator.witnessAt(13), BigInt(10))
        for(let i = 0; i < 10; i++) {
            assert.equal(calculator.witnessAt(14 + i), BigInt(i))
        }

        assert.equal(calculator.witnessAt(1), BigInt(100))
        assert.equal(calculator.witnessAt(2), BigInt(100))
        for(let i = 0; i < 10; i++) {
            assert.equal(calculator.witnessAt(3 + i), BigInt(i * i))
        }
    })
})
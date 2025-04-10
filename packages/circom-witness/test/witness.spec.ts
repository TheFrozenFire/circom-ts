import { assert } from "chai";
import { Witness, SymbolReader } from "../src/index.js"

import { readFile } from "fs/promises"

describe("Witness Execution", async () => {
    it("Read + write", async () => {
        const wasmFile = await readFile("test/fixture/test.wasm")
        const symbolsFile = await readFile("test/fixture/test.sym")
        const symbols = (new SymbolReader(symbolsFile.toString()).readSymbolMap())

        const calculator = new Witness(wasmFile, symbols)
        await calculator.init()
        console.log(calculator.memory.buffer.byteLength)
        const accessor = await calculator.calculate({
            "in": 10,
            "inMustBeOne": 1,
            "inArray": [...Array(10).keys()],
        })
        
        assert.equal(accessor.value("main.in"), 10n)
        assert.deepEqual(accessor.array("main.inArray"), [...Array(10).keys()].map((i) => BigInt(i)))

        assert.equal(accessor.value("main.out"), BigInt(100))
        assert.equal(accessor.value("main.outAnon"), BigInt(100))
        assert.deepEqual(accessor.array("main.outArray"), [...Array(10).keys()].map((i) => BigInt(i * i)))

        console.log("Memory size", calculator.memory.buffer.byteLength)
    })

    it("Error handling", async () => {
        const wasmFile = await readFile("test/fixture/test.wasm")
        const symbolsFile = await readFile("test/fixture/test.sym")
        const symbols = (new SymbolReader(symbolsFile.toString()).readSymbolMap())

        const calculator = new Witness(wasmFile, symbols)
        try {
            await calculator.calculate({
                "in": 10,
                "inMustBeOne": 2,
                "inArray": [...Array(10).keys()],
            })
            assert.fail("Should have thrown")
        } catch(e) {
            assert.equal(e.message, "Assert Failed")
            assert.isNotEmpty(e.errors, "Should have errors")
        }
    })
})
import { assert } from "chai";
import { WasmWrapper } from "../src/index.js"

import { readFile } from "fs/promises"

describe("WASM Execution", async () => {
    it("", async () => {
        const file = await readFile("test/fixture/test.wasm")
        const wasm = new WasmWrapper(file)

        await wasm.init()

        assert.equal(wasm.version, 2)
        assert.equal(wasm.minorVersion, 1)
        assert.equal(wasm.patchVersion, 5)

        // Why? This doesn't look like the bn128 prime
        assert.equal(wasm.prime, BigInt('21888242844879328548818664213742077600362041385367538672338993241347936223233'))

        assert.equal(wasm.witnessSize, 28)
        assert.equal(wasm.inputSize, 11)
    })
})
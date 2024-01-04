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

        assert.equal(wasm.prime, BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617'))

        assert.equal(wasm.witnessSize, 24)
        assert.equal(wasm.inputSize, 11)
    })
})
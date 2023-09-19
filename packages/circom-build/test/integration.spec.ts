import { assert } from "chai";

import temp from "temp"
import * as fs from "fs"

import {
    Instance,
    CircomCommand,
    SnarkScheme,
    SnarkJSSetup
} from "../src/index.js"

describe("Circuit Integration", async () => {
    it("Compile and Phase 1", async () => {
        const temp_dir = temp.mkdirSync()

        const instance = new Instance("test/fixture/test.circom", "Test", [])
        const command = new CircomCommand(instance, {
            output: temp_dir,
            libraries: [process.cwd()],
            r1cs: true,
            sym: true,
            wasm: true,
            optimize: 0,
        })

        await command.execute()

        assert.isTrue(fs.existsSync(command.paths.r1cs))
        assert.isTrue(fs.existsSync(command.paths.sym))
        assert.isTrue(fs.existsSync(command.paths.wasm))

        const setup = new SnarkJSSetup(command.paths.r1cs)

        await setup.phase1(SnarkScheme.Groth16, process.env.POWERS_OF_TAU_FILE as string)

        assert.isTrue(fs.existsSync(setup.zkey_path))
    })
})
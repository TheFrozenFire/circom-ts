import { assert } from "chai";

import temp from "temp"
import * as fs from "fs"

import {
    Instance,
    CircomCommand,
    SnarkJSSetup
} from "../src/index.js"

import {
    SnarkScheme
} from "@frozenfire/circom-common"

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

        const r1cs_details = await setup.r1cs_details

        console.table({
            nVars: r1cs_details.nVars,
            nOutputs: r1cs_details.nOutputs,
            nPubInputs: r1cs_details.nPubInputs,
            nPrvInputs: r1cs_details.nPrvInputs,
            nLabels: r1cs_details.nLabels,
            nConstraints: r1cs_details.nConstraints,
        })

        await setup.phase1(SnarkScheme.Groth16, process.env.POWERS_OF_TAU_FILE as string)

        assert.isTrue(fs.existsSync(setup.zkey_path))
    })
})
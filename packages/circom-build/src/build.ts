import temp from "temp"
import { join as pathJoin } from "path"

import { Instance } from "./instance.js"
import { Constants } from "./constants.js"
import { CircomCommand } from "./command.js"

export class Build {
    public instance: Instance
    public constants: Constants

    constructor(
        _template_file: string,
        _template_name: string,
        _params: number[],
        _pragma?: string,
        _public_inputs?: string[],
        _constants: object = {},
    ) {
        this.instance = new Instance(
            _template_file,
            _template_name,
            _params,
            _pragma,
            _public_inputs,
        )

        this.constants = new Constants(_constants)
    }

    async compile(options: object = {}) {
        const temp_dir = temp.mkdirSync()
        this.instance.temp_dir = temp_dir
        this.constants.temp_dir = temp_dir

        await this.constants.create()

        const command = new CircomCommand(this.instance, Object.assign({
            output: this.instance.temp_dir,
            libraries: [pathJoin(process.cwd(), "circuits"), this.instance.temp_dir],
            verbose: false,
            r1cs: true,
            sym: true,
            wasm: true,
            optimize: 0,
        }, options))

        return { command, result: await command.execute()}
    }
}
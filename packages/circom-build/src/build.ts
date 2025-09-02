import temp from "temp"
import { join as pathJoin } from "path"

import { Instance } from "./instance.js"
import { Constants } from "./constants.js"
import { CircomCommand } from "./command.js"

export class Build {
    public instance: Instance
    public constants: Constants
    public temp_dir: string

    constructor(
        _template_file: string,
        _template_name: string,
        _params: number[],
        _pragma?: string,
        _public_inputs?: string[],
        _constants: object = {},
        _temp_dir?: string,
    ) {

        this.temp_dir = temp.mkdirSync({ dir: _temp_dir })

        this.instance = new Instance(
            _template_file,
            _template_name,
            _params,
            _pragma,
            _public_inputs,
            this.temp_dir,
        )

        this.constants = new Constants(_constants, _pragma, this.temp_dir)
    }

    async compile(options: object = {}) {
        await this.constants.create()

        const command = new CircomCommand(this.instance, Object.assign({
            output: this.temp_dir,
            libraries: [pathJoin(process.cwd(), "circuits"), this.temp_dir],
            verbose: false,
            r1cs: true,
            sym: true,
            wasm: true,
            optimize: 0,
        }, options))

        return { command, result: await command.execute()}
    }
}
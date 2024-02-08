import temp from "temp"
import fs from "fs"
import path from "path"

export class Constants {
    constructor(
        public constants: object = {},
        public pragma: string = "2.0.0",
        public temp_dir?: string,
    ) {}

    get temp_file_contents() {
        const constant_function_strings = Object.entries(this.constants).map(([name, value]) => `function ${name} () { return ${value}; }`)

        return `
            pragma circom ${this.pragma};

            ${constant_function_strings.join("\n\n")}
        `;
    }

    create() {
        const temp_constants = fs.openSync(
            path.join(this.temp_dir, "constants.circom"),
            "w"
        )

        fs.writeSync(
            temp_constants,
            this.temp_file_contents,
        )
    }
}
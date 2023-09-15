import temp from "temp"
import fs from "fs"

export class Instance {
    constructor(
        public template_file: string,
        public template_name: string,
        public params: number[],
        public pragma: string = "2.0.0",
        public public_inputs: string[] = [],
    ) {}

    get temp_file_contents() {
        const params_string = JSON.stringify(this.params).slice(1, -1)
        const public_inputs_string = this.public_inputs.join(", ")
        const public_inputs_declaration =
            this.public_inputs.length > 0 ? `{public [${public_inputs_string}] }` : ""
        
        return `
            pragma circom ${this.pragma}

            include "${this.template_file}"

            component main ${public_inputs_declaration} = ${this.template_name}(${params_string})
        `;
    }

    get temp_file(): temp.OpenFile {
        temp.track()

        const temp_circuit = temp.openSync({
            prefix: this.template_name,
            suffix: ".circom",
        })

        fs.writeSync(
            temp_circuit.fd,
            this.temp_file_contents,
        )

        return temp_circuit
    }
}
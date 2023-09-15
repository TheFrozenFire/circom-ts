import { exec, ExecOptions } from "child_process"
import path from "path"
import { Instance } from "./instance.js"

export type CircomOptions = {
    r1cs: boolean,
    sym: boolean,
    wasm: boolean,
    json: boolean,
    wat: boolean,
    c: boolean,
    optimize: number,
    optimize2_round: number,
    verbose: boolean,
    inspect: boolean,
    use_old_simplification_heuristics: boolean,
    output: string,
    prime: string,
    libraries: string[],
}

export class CircomCommand {
    public input: string
    public circom_executable: string = "circom"
    public exec_options: ExecOptions

    constructor(
        public _input: string | Instance,
        public options?: CircomOptions
    ) {
        this.input = typeof _input === "string" ? _input : _input.temp_file.path
    }

    execute() {
        return new Promise((resolve, reject) => {
            exec(this.command, this.exec_options, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({ stdout, stderr })
                }
            })
        })
    }

    get command(): string {
        return `${this.circom_executable} ${this.command_flags.join(" ")} ${this.input}`
    }

    get command_flags(): string[] {
        let flags = [];

        if (this.options.r1cs) {
            flags.push("--r1cs");
        }

        if (this.options.sym) {
            flags.push("--sym");
        }

        if (this.options.wasm) {
            flags.push("--wasm");
        }

        if (this.options.json) {
            flags.push("--json");
        }

        if (this.options.wat) {
            flags.push("--wat");
        }

        if (this.options.c) {
            flags.push("--c");
        }

        if (this.options.optimize) {
            flags.push(`--O${this.options.optimize}`);
        }

        if (this.options.optimize2_round) {
            flags.push(`--O2round ${this.options.optimize2_round}`);
        }

        if (this.options.verbose) {
            flags.push("--verbose");
        }

        if (this.options.inspect) {
            flags.push("--inspect");
        }

        if (this.options.use_old_simplification_heuristics) {
            flags.push("--use_old_simplification_heuristics");
        }

        if (this.options.output) {
            flags.push(`--output ${this.options.output}`);
        }

        if (this.options.prime) {
            flags.push(`--prime ${this.options.prime}`);
        }

        for(const library of this.options.libraries) {
            flags.push(`-l ${library}`);
        }

        return flags;
    }

    get basename(): string {
        return path.basename(this.input, ".circom")
    }

    get paths() {
        return {
            r1cs: path.join(this.options.output, this.basename + ".r1cs"),
            sym: path.join(this.options.output, this.basename + ".sym"),
            wasm: path.join(this.options.output, this.basename + "_js", this.basename + ".wasm"),
        }
    }
}
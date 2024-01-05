/// <reference types="node" resolution-mode="require"/>
import { ExecOptions } from "child_process";
import { Instance } from "./instance.js";
export type CircomOptions = {
    output: string;
    r1cs?: boolean;
    sym?: boolean;
    wasm?: boolean;
    json?: boolean;
    wat?: boolean;
    c?: boolean;
    optimize?: number;
    optimize2_round?: number;
    verbose?: boolean;
    inspect?: boolean;
    use_old_simplification_heuristics?: boolean;
    prime?: string;
    libraries?: string[];
};
export declare class CircomCommand {
    _input: string | Instance;
    options: CircomOptions;
    input: string;
    circom_executable: string;
    exec_options: ExecOptions;
    constructor(_input: string | Instance, options: CircomOptions);
    execute(): Promise<unknown>;
    get command(): string;
    get command_flags(): string[];
    get basename(): string;
    get paths(): {
        r1cs: string;
        sym: string;
        wasm: string;
    };
}

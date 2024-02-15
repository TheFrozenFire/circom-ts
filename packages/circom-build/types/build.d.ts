import { Instance } from "./instance.js";
import { Constants } from "./constants.js";
import { CircomCommand } from "./command.js";
export declare class Build {
    instance: Instance;
    constants: Constants;
    constructor(_template_file: string, _template_name: string, _params: number[], _pragma?: string, _public_inputs?: string[], _constants?: object);
    compile(options?: object): Promise<{
        command: CircomCommand;
        result: unknown;
    }>;
}

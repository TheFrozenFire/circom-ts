import temp from "temp";
export declare class Instance {
    template_file: string;
    template_name: string;
    params: number[];
    pragma: string;
    public_inputs: string[];
    constructor(template_file: string, template_name: string, params: number[], pragma?: string, public_inputs?: string[]);
    get temp_file_contents(): string;
    get temp_file(): temp.OpenFile;
}

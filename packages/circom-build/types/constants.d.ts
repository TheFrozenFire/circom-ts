export declare class Constants {
    constants: object;
    pragma: string;
    temp_dir?: string;
    constructor(constants?: object, pragma?: string, temp_dir?: string);
    get temp_file_contents(): string;
    create(): void;
}

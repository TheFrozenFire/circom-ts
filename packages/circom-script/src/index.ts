import * as ts from 'typescript';
import * as path from 'path';

const configPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    "tsconfig.json"
);

if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
}

const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);

if (error) {
    throw new Error(ts.formatDiagnostic(error, ts.createCompilerHost({})));
}

const parsedCommandLine = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath)
);

//const compilerHost = createCustomCompilerHost(parsedCommandLine.options);

const program = ts.createProgram(
    parsedCommandLine.fileNames,
    parsedCommandLine.options,
    //compilerHost
);

const emitResult = program.emit();

const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
});

if (emitResult.emitSkipped) {
    process.exit(1);
}
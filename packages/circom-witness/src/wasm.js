export const ERROR_MESSAGES = Object.freeze({
    1: "Signal not found",
    2: "Too many signals",
    3: "Signal already set",
    4: "Assert failed",
    5: "Not enough memory",
    6: "Input signal array access exceeds the size"
});
export class WasmWrapper {
    code;
    memory;
    logger;
    instance;
    errorAccumulator = [];
    messageAccumulator = [];
    // Size of the field element in 32-bit words
    fieldElementUint32Size;
    constructor(code, memory, logger = (messages) => console.log(messages.join(" "))) {
        this.code = code;
        this.memory = memory;
        this.logger = logger;
        this.memory = memory || new WebAssembly.Memory({ initial: 32767 });
    }
    static signalNameHash(name) {
        const uint64_max = BigInt(2 ** 64);
        let hash = BigInt("0xCBF29CE484222325");
        for (let i = 0; i < name.length; i++) {
            hash ^= BigInt(name.charCodeAt(i));
            hash *= BigInt("0x100000001B3");
            hash %= uint64_max;
        }
        const sHash = hash.toString(16).padStart(16, '0');
        return [parseInt(sHash.slice(0, 8), 16), parseInt(sHash.slice(8, 16), 16)];
    }
    async init(sanityCheck = false) {
        if (this.instance) {
            this.instance.exports.init(sanityCheck);
            return;
        }
        ({ instance: this.instance } = await WebAssembly.instantiate(this.code, {
            env: {
                memory: this.memory,
            },
            runtime: this.runtime
        }));
        this.fieldElementUint32Size = this.instance.exports.getFieldNumLen32();
        this.instance.exports.init(sanityCheck);
    }
    get runtime() {
        return {
            exceptionHandler: this.exceptionHandler.bind(this),
            printErrorMessage: this.printErrorMessage.bind(this),
            writeBufferMessage: this.writeBufferMessage.bind(this),
            showSharedRWMemory: this.showSharedRWMemory.bind(this),
        };
    }
    get version() {
        return this.instance.exports.getVersion();
    }
    get minorVersion() {
        return this.instance.exports.getMinorVersion();
    }
    get patchVersion() {
        return this.instance.exports.getPatchVersion();
    }
    get prime() {
        this.instance.exports.getRawPrime();
        return this.readFieldElement();
    }
    get witnessSize() {
        return this.instance.exports.getWitnessSize();
    }
    get inputSize() {
        return this.instance.exports.getInputSize();
    }
    get witness() {
        const witness = new Array(this.witnessSize);
        for (let i = 0; i < this.witnessSize; i++) {
            witness[i] = this.witnessAt(i);
        }
        return witness;
    }
    witnessAt(index) {
        this.instance.exports.getWitness(index);
        return this.readFieldElement();
    }
    readFieldElement() {
        const arr = new Array(this.fieldElementUint32Size);
        for (let i = 0; i < this.fieldElementUint32Size; i++) {
            arr[this.fieldElementUint32Size - 1 - i] = this.instance.exports.readSharedRWMemory(i);
        }
        return arr.reduce((acc, val) => { return acc * BigInt(2 ** 32) + BigInt(val); }, BigInt(0));
    }
    writeFieldElement(value) {
        const res = new Uint32Array(this.fieldElementUint32Size);
        let rem = value;
        for (let i = 0; i < this.fieldElementUint32Size; i++) {
            this.instance.exports.writeSharedRWMemory(i, Number(rem % BigInt(2 ** 32)));
            rem /= BigInt(2 ** 32);
        }
    }
    writeSignal(name, index, value) {
        const [msb, lsb] = WasmWrapper.signalNameHash(name);
        this.writeFieldElement(value);
        this.instance.exports.setInputSignal(msb, lsb, index);
    }
    exceptionHandler(code) {
        const accumulatedErrors = this.errorAccumulator.join("\n");
        this.errorAccumulator = [];
        throw new Error(ERROR_MESSAGES[code], {
            cause: accumulatedErrors
        });
    }
    printErrorMessage() {
        this.errorAccumulator.push(this.retrieveMessage());
    }
    writeBufferMessage() {
        this.messageAccumulator.push(this.retrieveMessage());
        if (this.messageAccumulator[-1] == "\n") {
            this.logger(this.messageAccumulator);
            this.messageAccumulator = [];
        }
    }
    showSharedRWMemory() {
        const shared_rw_memory_size = this.instance.exports.getFieldNumLen32();
        const arr = new Uint32Array(shared_rw_memory_size);
        for (let i = 0; i < shared_rw_memory_size; i++) {
            arr[shared_rw_memory_size - 1 - i] = this.instance.exports.readSharedRWMemory(i);
        }
        this.messageAccumulator.push(arr.reduce((acc, val) => { return acc * BigInt(2 ** 32) + BigInt(val); }, BigInt(0)).toString());
    }
    retrieveMessage() {
        let message = "";
        let c = this.instance.exports.getMessageChar();
        while (c != 0) {
            message += String.fromCharCode(c);
            c = this.instance.exports.getMessageChar();
        }
        return message;
    }
    retrieveStringFromPointer(pointer) {
        const memory8 = new Uint8Array(this.memory.buffer, pointer);
        const end = memory8.indexOf(0);
        return new TextDecoder().decode(memory8.subarray(0, end));
    }
}

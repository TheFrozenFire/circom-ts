import path from "path"
import { zKey, plonk, fflonk } from "snarkjs"

export enum SnarkScheme {
    Groth16,
    Plonk,
    FFlonk,
}

export class SnarkJSSetup {
    constructor(
        public r1cs: string
    ) {}

    get zkey_path(): string {
        return path.join(path.dirname(this.r1cs), path.basename(this.r1cs, ".r1cs") + "_00000.zkey")
    }

    async phase1(scheme: SnarkScheme, ptau: string): Promise<Uint8Array> {
        switch (scheme) {
            case SnarkScheme.Groth16:
                return zKey.newZKey(this.r1cs, ptau, this.zkey_path)
            case SnarkScheme.Plonk:
                return plonk.plonkSetup(this.r1cs, ptau, this.zkey_path)
            case SnarkScheme.FFlonk:
                return fflonk.fflonkSetup(this.r1cs, ptau, this.zkey_path)
        }
    }
}
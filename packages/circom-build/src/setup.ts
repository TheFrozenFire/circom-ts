import path from "path"
import { zKey, plonk, fflonk } from "snarkjs"
import { readR1cs }  from "r1csfile"

import { SnarkScheme, FixedLengthArray } from "@frozenfire/circom-common"

export type R1CSCoefficient = { [key: number]: bigint }
export type R1CSConstraint = FixedLengthArray<[R1CSCoefficient, R1CSCoefficient, R1CSCoefficient]>

export type R1CSDetails = {
    n8: number,
    prime: bigint,
    nVars: number,
    nOutputs: number,
    nPubInputs: number,
    nPrvInputs: number,
    nLabels: number,
    nConstraints: number,
    useCustomGates: boolean,

    constraints: R1CSConstraint[],
    customGates: unknown,
    customGatesUses: unknown,
    map: number[],
}

export class SnarkJSSetup {
    constructor(
        public r1cs: string
    ) {}

    get zkey_path(): string {
        return path.join(path.dirname(this.r1cs), path.basename(this.r1cs, ".r1cs") + "_00000.zkey")
    }

    get r1cs_details(): Promise<R1CSDetails> {
        return readR1cs(this.r1cs, true, true, false).then((cir) => {
            delete cir.curve
            delete cir.F
            
            return cir
        })
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
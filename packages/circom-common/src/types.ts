type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends any[]> =
    Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
    & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> }

export type FieldElement = BigInt | bigint
export type G1Point = FixedLengthArray<[FieldElement, FieldElement]>
export type Point = G1Point
export type G2Point = FixedLengthArray<[[FieldElement, FieldElement], [FieldElement, FieldElement]]>
export type G12Point = FixedLengthArray<[[FieldElement, FieldElement], [FieldElement, FieldElement], [FieldElement, FieldElement]]>

export type ProjectiveG1Point = FixedLengthArray<[FieldElement, FieldElement, number]>
export type ProjectiveG2Point = FixedLengthArray<[[FieldElement, FieldElement], [FieldElement, FieldElement], [number, number]]>

export type Groth16Proof = { a: G1Point, b: G2Point, c: G1Point }
export type SnarkJSGroth16Proof = { pi_a: ProjectiveG1Point, pi_b: ProjectiveG2Point, pi_c: ProjectiveG1Point }

export type SnarkJSProverResult = {
    proof: SnarkJSGroth16Proof,
    publicSignals: string[]
}
export type ProverResult = {
    proof: Groth16Proof,
    publicSignals: string[]
}

export type Groth16VerificationKey = {
    protocol: string,
    curve: string,
    nPublic: number,
    vk_alpha_1: G1Point,
    vk_beta_2: G2Point,
    vk_gamma_2: G2Point,
    vk_delta_2: G2Point,
    vk_alphabeta_12: G12Point,
    IC: G1Point[]
}

export type Hexlified<T> = {
    [P in keyof T]: T[P] extends (bigint | BigInt) // For bigint to string conversion
    ? string
    : T[P] extends Array<infer U> // For arrays, apply transformation recursively to array items
    ? Array<Hexlified<U>>
    : T[P] extends object // For nested objects, apply transformation recursively
    ? Hexlified<T[P]>
    : T[P]; // For types that do not need transformation
}

export enum SnarkScheme {
    Groth16,
    Plonk,
    FFlonk,
}
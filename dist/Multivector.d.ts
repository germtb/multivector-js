import { Base } from "./Base";
export declare class Multivector {
    private values;
    private constructor();
    static scalar(value: number): Multivector;
    static zero(): Multivector;
    static one(): Multivector;
    static vector(value: number, base: Base): Multivector;
    static bivector(value: number, base1: Base, base2: Base): Multivector;
    static nvector(value: number, ...bases: Base[]): Multivector;
    static fromArray(values: Array<number>): Multivector;
    product(m: Multivector): Multivector;
    add(m: Multivector): Multivector;
    sub(m: Multivector): Multivector;
    scalarPart(): Multivector;
    pow(power: number): Multivector;
    toString(): string;
}
//# sourceMappingURL=Multivector.d.ts.map
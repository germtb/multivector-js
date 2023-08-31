import { Base } from "../Base";
import { Multivector } from "../Multivector";

const zero = Multivector.zero();
const one = Multivector.scalar(1);
const two = Multivector.scalar(2);

const e1 = Multivector.vector(1, 1);
const e2 = Multivector.vector(1, 2);
const e3 = Multivector.vector(1, 3);

const e12 = Multivector.nvector(1, 1, 2);
const e13 = Multivector.nvector(1, 1, 3);
const e123 = Multivector.nvector(1, 1, 2, 3);
const e1234 = Multivector.nvector(1, 1, 2, 3, 4);
const e12345 = Multivector.nvector(1, 1, 2, 3, 4, 5);
const e123456 = Multivector.nvector(1, 1, 2, 3, 4, 5, 6);
const e1234567 = Multivector.nvector(1, 1, 2, 3, 4, 5, 6, 7);
const e12345678 = Multivector.nvector(1, 1, 2, 3, 4, 5, 6, 7, 8);

describe("multivector", () => {
  it("should handle scalar addition", () => {
    expect(one.add(one).add(zero)).toEqual(two);
  });

  it("should handle scalar product", () => {
    expect(one.product(two).product(two)).toEqual(Multivector.scalar(4));
  });

  it("should handle vector addition", () => {
    expect(e1.add(e2).add(e3).toString()).toEqual("e₁ + e₂ + e₃");
  });

  it("should handle vector and scalar addition", () => {
    expect(e1.add(one).add(two).add(e2).toString()).toEqual("3 + e₁ + e₂");
  });

  it("should handle vector and scalar product", () => {
    expect(e1.add(one).add(two).add(e2).product(two).toString()).toEqual(
      "6 + 2e₁ + 2e₂"
    );
  });

  it("should handle vector addition in any order", () => {
    expect(e3.add(e2).add(e1).toString()).toEqual("e₁ + e₂ + e₃");
  });

  it("should handle vector product", () => {
    const m1 = Multivector.vector(2, 1);
    const m2 = Multivector.vector(2, 2);
    expect(m1.product(m2).toString()).toEqual("4e₁e₂");
  });

  it("should handle vector and bivector product", () => {
    const m1 = Multivector.vector(2, 1);
    const m2 = Multivector.vector(2, 2);
    expect(m1.product(m2).product(m2).toString()).toEqual("8e₁");
  });

  it("should handle base simplification", () => {
    expect(e1.product(e1)).toEqual(one);
    expect(e1.product(e1).product(e1)).toEqual(e1);
    expect(e2.product(e1).toString()).toEqual("- e₁e₂");
    expect(e1.product(e2).product(e3).toString()).toEqual("e₁e₂e₃");
  });

  it("should handle negative vector addition", () => {
    const m1 = Multivector.vector(-1, 1);
    const m2 = Multivector.vector(1, 2);
    const m3 = Multivector.vector(-1, 3);
    expect(m1.add(m2).add(m3).toString()).toEqual("- e₁ + e₂ - e₃");
  });

  it("should handle bivector addition", () => {
    const m12 = Multivector.bivector(1, 1, 2);
    const m23 = Multivector.bivector(2, 2, 3);
    expect(m12.add(m23).toString()).toEqual("e₁e₂ + 2e₂e₃");
  });

  it("should handle nvectors", () => {
    let m = Multivector.zero();

    for (let i = 1; i <= 4; i++) {
      m = m.add(Multivector.nvector(1, ...range(i, 1).map((n) => n as Base)));
    }

    expect(m.toString()).toEqual("1 + e₁ + e₁e₂ + e₁e₂e₃");
  });

  it("should handle scalar substraction", () => {
    expect(one.sub(one).toString()).toEqual("0");
    expect(e1.sub(one).toString()).toEqual("-1 + e₁");
  });

  it("should handle vector substraction", () => {
    expect(e1.sub(e1).toString()).toEqual("0");
    expect(e1.sub(e2).toString()).toEqual("e₁ - e₂");
  });

  it("should handle bivector substraction", () => {
    expect(e12.sub(e1).toString()).toEqual("- e₁ + e₁e₂");
  });

  it("handles exponentiation", () => {
    const m = one.add(e1);

    expect(m.toString()).toEqual("1 + e₁");
    expect(m.pow(2).toString()).toEqual("2 + 2e₁");
    expect(m.pow(3).toString()).toEqual("4 + 4e₁");
    expect(m.pow(4).toString()).toEqual("8 + 8e₁");
  });

  it("should handle rotors", () => {
    const m1 = e1.add(e2);
    const module1 = Math.sqrt(m1.product(m1).scalarComponent());
    const [R1, R2] = Multivector.rotor(Math.PI / 2, 1, 2);
    const m2 = R1.product(m1).product(R2);
    const module2 = Math.sqrt(m2.product(m2).scalarComponent());
    expect(module1.toFixed(5)).toEqual(module2.toFixed(5));
    expect(Math.round(m2.component(1))).toEqual(-1);
    expect(m2.component(2)).toEqual(1);
  });

  it("should handle rotations", () => {
    let v = e1.add(e2).add(e3);

    // Rotate on each axis 90 degrees
    v = v.rotate(Math.PI / 2, 1, 2);
    v = v.rotate(Math.PI / 2, 2, 3);
    v = v.rotate(Math.PI / 2, 1, 3);

    expect(Math.round(v.component(1))).toEqual(-1);
    expect(Math.round(v.component(2))).toEqual(-1);
    expect(Math.round(v.component(3))).toEqual(-1);

    // Invert the rotation (steps need to happen in reverse order)
    v = v.rotate(-Math.PI / 2, 2, 3);
    v = v.rotate(-Math.PI / 2, 1, 2);
    v = v.rotate(-Math.PI / 2, 1, 3);

    expect(Math.round(v.component(1))).toEqual(1);
    expect(Math.round(v.component(2))).toEqual(1);
    expect(Math.round(v.component(3))).toEqual(1);
  });

  it("should handle conjugate", () => {
    const i = e12;
    expect(i.conjugate().toString()).toEqual("- e₁e₂");

    const m1 = e1;
    expect(m1.conjugate().toString()).toEqual("e₁");

    const m2 = one.add(e12);
    expect(m2.conjugate().toString()).toEqual("1 - e₁e₂");
  });

  it("should handle module", () => {
    expect(e1.module()).toEqual(1);
    expect(e1.add(e2).module()).toEqual(Math.SQRT2);

    const i = e12;
    expect(i.module()).toEqual(1);

    const m1 = e12.add(e13);
    expect(m1.module()).toEqual(Math.SQRT2);
  });

  it("should handle blades", () => {
    const m = e1.add(e2).add(e12);

    expect(m.blade(0).toString()).toEqual("0");
    expect(m.blade(1).toString()).toEqual("e₁ + e₂");
    expect(m.blade(2).toString()).toEqual("e₁e₂");
  });

  it("should calculate the cosine between a bivector and a vector", () => {
    expect(e12.product(e1).blade(1).moduleSquare()).toEqual(1);
    expect(
      e12
        .product(e1.add(e3).product(1 / Math.SQRT2))
        .blade(1)
        .moduleSquare()
        .toPrecision(1)
    ).toEqual("0.5");
    expect(e12.product(e3).blade(1).moduleSquare()).toEqual(0);
  });

  it("should handle mixations", () => {
    const plane = e1.product(e2);
    expect(Multivector.mixation(plane).mix(e1, Math.PI).component(1)).toEqual(
      -1
    );
    expect(Multivector.mixation(plane).mix(e3, Math.PI).component(3)).toEqual(
      1
    );
  });
});

function range(max: number, min: number = 0, step: number = 1): Array<number> {
  const result = [];

  for (let i = min; i < max; i += step) {
    result.push(i);
  }

  return result;
}

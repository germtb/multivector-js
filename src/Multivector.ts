import { Base } from "./Base";
import { TypedArrayMap } from "./TypedArrayMap";

export class Multivector {
  private values: TypedArrayMap<number>;

  private constructor(values: TypedArrayMap<number> = new TypedArrayMap()) {
    this.values = values;
  }

  static scalar(value: number): Multivector {
    return Multivector.nvector(value);
  }

  static zero(): Multivector {
    return Multivector.scalar(0);
  }

  static one(): Multivector {
    return Multivector.scalar(1);
  }

  static vector(value: number, base: Base): Multivector {
    return Multivector.nvector(value, base);
  }

  static bivector(value: number, base1: Base, base2: Base): Multivector {
    return Multivector.nvector(value, base1, base2);
  }

  static nvector(value: number, ...bases: Base[]): Multivector {
    const [finalBase, finalValue] = simplifyBase(new Uint8Array(bases), value);
    return new Multivector(
      new TypedArrayMap<number>().set(finalBase, finalValue)
    );
  }

  static fromArray(values: Array<number>): Multivector {
    const state = new TypedArrayMap<number>();

    for (let i = 0; i < values.length; i++) {
      if (values[i] === 0) {
        continue;
      }
      state.set(new Uint8Array([i + 1]), values[i]);
    }

    return new Multivector(state);
  }

  product(m: Multivector | number): Multivector {
    if (typeof m === "number") {
      return this.product(Multivector.scalar(m));
    }

    const newValues = new TypedArrayMap<number>();

    for (const otherElement of m.values.entries()) {
      for (const selfElement of this.values.entries()) {
        const tempValue = otherElement[1] * selfElement[1];
        const otherBase = otherElement[0];
        const selfBase = selfElement[0];
        const tempBase = new Uint8Array(otherBase.length + selfBase.length);
        tempBase.set(selfBase);
        tempBase.set(otherBase, selfBase.length);

        let [finalBase, finalValue] = simplifyBase(tempBase, tempValue);

        newValues.update(finalBase, (current) => current + finalValue, 0);

        if (newValues.get(finalBase) === 0) {
          newValues.remove(finalBase);
        }
      }
    }

    const result = new Multivector(newValues);

    if (
      result.values.size() !== 0 &&
      result.values.get(new Uint8Array([])) === 0
    ) {
      result.values.remove(new Uint8Array([]));
    }

    return result;
  }

  static rotor(
    angle: number,
    base1: Base,
    base2: Base
  ): [Multivector, Multivector] {
    if (base1 === base2) {
      throw new Error("Cannot create a rotor with equal bases");
    }

    return [
      Multivector.scalar(Math.cos(-angle / 2)).add(
        Multivector.bivector(Math.sin(-angle / 2), base1, base2)
      ),
      Multivector.scalar(Math.cos(angle / 2)).add(
        Multivector.bivector(Math.sin(angle / 2), base1, base2)
      ),
    ];
  }

  add(m: Multivector | number): Multivector {
    if (typeof m === "number") {
      return this.add(Multivector.scalar(m));
    }

    const newValues = new TypedArrayMap<number>(this.values);

    for (const [key, value] of m.values.entries()) {
      const newValue = value + (newValues.get(key) ?? 0);
      if (newValue === 0) {
        newValues.remove(key);
      } else {
        newValues.set(key, newValue);
      }
    }

    return new Multivector(newValues);
  }

  sub(m: Multivector): Multivector {
    return this.add(m.product(Multivector.scalar(-1)));
  }

  part(...bases: Base[]): number {
    return this.values.get(new Uint8Array(bases)) ?? 0;
  }

  scalarPart(): number {
    return this.part();
  }

  pow(power: number): Multivector {
    let m = Multivector.scalar(1);

    for (let i = 0; i < power; i++) {
      m = m.product(this);
    }

    return m;
  }

  toString(): string {
    const entries = Array.from(this.values.entries());

    entries.sort(([key1], [key2]) => {
      if (key1.length > key2.length) {
        return 1;
      } else if (key1.length < key2.length) {
        return -1;
      } else {
        // TODO
        const sortedKey1 = Array.from(key1).sort();
        const sortedKey2 = Array.from(key2).sort();

        while (sortedKey1.length) {
          const subKey1 = sortedKey1.pop() ?? 0;
          const subKey2 = sortedKey2.pop() ?? 0;
          if (subKey1 > subKey2) {
            return 1;
          } else if (subKey1 < subKey2) {
            return -1;
          }
        }

        return 0;
      }
    });

    const result = entries
      .map(([key, value], index) => {
        if (key.length === 0) {
          return value;
        } else {
          const sign = value > 0 ? "+ " : "- ";
          const prefix = index > 0 || value < 0 ? sign : "";

          const finalValue = Math.abs(value) === 1 ? "" : Math.abs(value);
          const base = Array.from(key)
            .map((b) => `e${subscript(b)}`)
            .join("");

          return `${prefix}${finalValue}${base}`;
        }
      })
      .join(" ");

    return result === "" ? "0" : result;
  }
}

const subscriptMap: { [key: string]: string } = {
  "0": "\u2080",
  "1": "\u2081",
  "2": "\u2082",
  "3": "\u2083",
  "4": "\u2084",
  "5": "\u2085",
  "6": "\u2086",
  "7": "\u2087",
  "8": "\u2088",
  "9": "\u2089",
};

function subscript(number: number): string {
  return Array.from(number.toString())
    .map((c) => subscriptMap[c] ?? c)
    .join("");
}

function simplifyBase(base: Uint8Array, value: number): [Uint8Array, number] {
  let swaps = 0;

  while (true) {
    let newSwaps = 0;
    for (let i = 0; i < base.length; i++) {
      if (base[i] > base[i + 1]) {
        const temp = base[i];
        base[i] = base[i + 1];
        base[i + 1] = temp;
        swaps++;
        newSwaps++;
      } else {
        continue;
      }
    }

    if (newSwaps === 0) {
      break;
    }
  }

  const finalBase = new Uint8Array(
    Array.from(base).filter((x, i) => x !== base[i + 1] && x !== base[i - 1])
  );

  return [finalBase, value * (swaps % 2 === 0 ? 1 : -1)];
}

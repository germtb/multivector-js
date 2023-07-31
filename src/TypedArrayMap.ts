const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class TypedArrayMap<T> {
  private map: Map<string, T>;

  private encode(key: Uint8Array): string {
    if (key.length === 0) {
      return "";
    }

    return decoder.decode(key);
  }

  private decode(key: string): Uint8Array {
    if (key === "") {
      return new Uint8Array([]);
    }

    return encoder.encode(key);
  }

  constructor(from?: TypedArrayMap<T>) {
    this.map = from?.map ? new Map(from.map) : new Map();
  }

  set(array: Uint8Array, value: T): TypedArrayMap<T> {
    this.map.set(this.encode(array), value);
    return this;
  }

  get(array: Uint8Array): T | undefined {
    return this.map.get(this.encode(array));
  }

  update(array: Uint8Array, updater: (old: T) => T, def: T) {
    const current = this.get(array) ?? def;
    this.set(array, updater(current));
  }

  size() {
    return this.map.size;
  }

  remove(key: Uint8Array): boolean {
    return this.map.delete(this.encode(key));
  }

  clear() {
    return this.map.clear();
  }

  values(): IterableIterator<T> {
    return this.map.values();
  }

  entries(): IterableIterator<[Uint8Array, T]> {
    return Array.from(this.map.entries())
      .map(([key, value]): [Uint8Array, T] => [this.decode(key), value])
      .values();
  }
}

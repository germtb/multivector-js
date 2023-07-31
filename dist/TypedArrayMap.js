const encoder = new TextEncoder();
const decoder = new TextDecoder();
export class TypedArrayMap {
    encode(key) {
        if (key.length === 0) {
            return "";
        }
        return decoder.decode(key);
    }
    decode(key) {
        if (key === "") {
            return new Uint8Array([]);
        }
        return encoder.encode(key);
    }
    constructor(from) {
        this.map = from?.map ? new Map(from.map) : new Map();
    }
    set(array, value) {
        this.map.set(this.encode(array), value);
        return this;
    }
    get(array) {
        return this.map.get(this.encode(array));
    }
    update(array, updater, def) {
        const current = this.get(array) ?? def;
        this.set(array, updater(current));
    }
    size() {
        return this.map.size;
    }
    remove(key) {
        return this.map.delete(this.encode(key));
    }
    clear() {
        return this.map.clear();
    }
    values() {
        return this.map.values();
    }
    entries() {
        return Array.from(this.map.entries())
            .map(([key, value]) => [this.decode(key), value])
            .values();
    }
}
//# sourceMappingURL=TypedArrayMap.js.map
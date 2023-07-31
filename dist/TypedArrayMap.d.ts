export declare class TypedArrayMap<T> {
    private map;
    private encode;
    private decode;
    constructor(from?: TypedArrayMap<T>);
    set(array: Uint8Array, value: T): TypedArrayMap<T>;
    get(array: Uint8Array): T | undefined;
    update(array: Uint8Array, updater: (old: T) => T, def: T): void;
    size(): number;
    remove(key: Uint8Array): boolean;
    clear(): void;
    values(): IterableIterator<T>;
    entries(): IterableIterator<[Uint8Array, T]>;
}
//# sourceMappingURL=TypedArrayMap.d.ts.map
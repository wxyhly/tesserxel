export declare abstract class Pool<T> {
    objects: T[];
    abstract constructObject(): T;
    pop(): T;
    push(...args: T[]): void;
    resize(size: number): this;
}

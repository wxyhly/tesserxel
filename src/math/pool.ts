// from cannon.js: src/utils/pool.js
export abstract class Pool<T> {
    objects: T[] = [];
    abstract constructObject(): T;
    pop() {
        if (this.objects.length === 0) {
            return this.constructObject();
        } else {
            return this.objects.pop()!;
        }
    }
    push(...args: T[]) {
        this.objects.push(...args);
    }
    resize(size: number) {
        let objects = this.objects;
        while (objects.length > size) {
            objects.pop();
        }
        while (objects.length < size) {
            objects.push(this.constructObject());
        }
        return this;
    }
}
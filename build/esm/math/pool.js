// from cannon.js: src/utils/pool.js
class Pool {
    objects = [];
    pop() {
        if (this.objects.length === 0) {
            return this.constructObject();
        }
        else {
            return this.objects.pop();
        }
    }
    push(...args) {
        this.objects.push(...args);
    }
    resize(size) {
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

export { Pool };
//# sourceMappingURL=pool.js.map

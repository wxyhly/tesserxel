type Relation = number[];
export class CosetTable {
    length = 1;
    private p = [0];
    cosets: number[][];
    // store int map for letters (e.g. "a" "b" "a'" "b'")
    private generatorMap: string[] = [];
    private generatorInvMap = new Map<string, number>;
    private letters: number = 0; // equal to generatorMap.length
    // map between integers, ("a" <-> "'a")
    private genInvMap: number[] = [];
    // int representation of relations and subsets
    private relations: Relation[];
    private subsets: Relation[];
    // convert word to int representation
    private parseWord(w: string) {
        const word: Relation = [];
        for (let i = 0; i < w.length; i++) {
            if (w[i + 1] == "'") {
                word.push(this.generatorInvMap.get(w[i] + "'")!);
                i++;
            } else {
                word.push(this.generatorInvMap.get(w[i])!);
            }
        }
        return word;
    }
    constructor(generator: string, relation: string[], subset: string[]) {
        for (const c of generator) {
            this.generatorInvMap.set(c, this.letters++);
            this.generatorMap.push(c);
            if (relation.includes(c + c)) {
                this.genInvMap[this.letters - 1] = this.letters - 1;
            } else {
                this.genInvMap[this.letters] = this.letters - 1;
                this.genInvMap[this.letters - 1] = this.letters;
                this.generatorInvMap.set(c + "'", this.letters++);
                this.generatorMap.push(c + "'");
            }
        }
        this.relations = relation.map(w => this.parseWord(w));
        this.subsets = subset.map(w => this.parseWord(w));
        this.cosets = [new Array(this.letters)];
    }
    private define(coset: number, gen: number) {
        this.cosets[coset][gen] = this.length;
        const newLine = new Array(this.letters);
        newLine[this.genInvMap[gen]] = coset;
        this.cosets.push(newLine);
        this.p.push(this.length);
        this.length++;
    }
    private coincidence(a: number, b: number) {
        const q: number[] = [];
        this.merge(a, b, q);
        for (let i = 0; i < q.length; i++) {
            const y = q[i];
            for (let x = 0; x < this.letters; x++) {
                const d = this.cosets[y][x];
                if (d !== undefined) {
                    let mu = this.findRep(y);
                    let v = this.findRep(d);
                    let mux = this.cosets[mu][x];
                    if (mux !== undefined) {
                        this.merge(v, mux, q);
                    } else {
                        this.cosets[mu][x] = v;
                    }
                    let vxinv = this.cosets[v][this.genInvMap[x]];
                    if (vxinv !== undefined) {
                        this.merge(mu, vxinv, q);
                    } else {
                        this.cosets[v][this.genInvMap[x]] = mu;
                    }
                }
            }
        }
    }
    private merge(a: number, b: number, q: number[]) {
        const i1 = this.findRep(a);
        const i2 = this.findRep(b);
        if (i1 !== i2) {
            const u = Math.min(i1, i2);
            const v = Math.max(i1, i2);
            this.p[v] = u;
            q.push(v);
        }
    }
    private findRep(k: number) {
        let l = k; let r = this.p[l];
        while (r !== l) {
            l = r; r = this.p[l];
        }
        let mu = k; r = this.p[mu];
        while (r !== l) {
            this.p[mu] = l; mu = r; r = this.p[mu];
        }
        return l;
    }
    private scanAndFill(coset: number, relation: number[]) {
        const r = relation.length - 1;
        let f = coset;
        let i = 0;
        let b = coset;
        let j = r;
        while (true) {
            let fxi: number;
            while (i <= r && (fxi = this.cosets[f][relation[i]]) !== undefined) {
                f = fxi; i++;
            }
            if (i > r) {
                if (f !== coset) this.coincidence(f, coset);
                return;
            }
            let bxjinv: number;
            while (j >= i && (bxjinv = this.cosets[b][this.genInvMap[relation[j]]]) !== undefined) {
                b = bxjinv; j--;
            }
            if (j < i) {
                this.coincidence(f, b);
                return;
            } else if (i === j) {
                this.cosets[b][this.genInvMap[relation[i]]] = f;
                this.cosets[f][relation[i]] = b;
                return;
            } else {
                this.define(f, relation[i]);
            }
        }
    }
    enumerate() {
        for (const w of this.subsets) {
            this.scanAndFill(0, w);
        }
        for (let a = 0; a < this.cosets.length; a++) {
            if (this.p[a] !== a) continue;
            for (const w of this.relations) {
                this.scanAndFill(a, w);
                if (this.p[a] !== a) break;
            }
            if (this.p[a] !== a) continue;
            for (let x = 0; x < this.letters; x++) {
                if (this.cosets[a][x] === undefined) this.define(a, x);
            }
        }
        this.compress();
        this.standardize();
        return this;
    }
    private compress() {
        let j = 0;
        let p2: number[] = [];
        for (let i = 0; i < this.p.length; i++) {
            if (this.p[i] === i) {
                p2[i] = j++;
            }
        }
        this.cosets = this.cosets.filter((v, i) => this.p[i] === i);
        for (let i = 0; i < this.cosets.length; i++) {
            for (let x = 0; x < this.letters; x++) {
                this.cosets[i][x] = p2[this.p[this.cosets[i][x]]];
            }
        }
        this.length = this.cosets.length;
    }
    private standardize() {
        let y = 1;
        for (let a = 0; a < this.cosets.length; a++) {
            for (let x = 0; x < this.letters; x++) {
                let b = this.cosets[a][x];
                if (b >= y) {
                    if (b > y) this.swapCoset(y, b);
                    y++;
                    if (y === this.length - 1) return;
                }
            }
        }
    }
    private swapCoset(b: number, y: number) {
        let z = this.cosets[y]; this.cosets[y] = this.cosets[b]; this.cosets[b] = z;
        for (let x = 0; x < this.letters; x++) {
            const ix = this.genInvMap[x];
            const u = this.cosets[y][x];
            const v = this.cosets[b][x];
            if (u === b) { this.cosets[y][x] = y; } else if (u === y) { this.cosets[y][x] = b; } else {
                this.cosets[u][ix] = y;
            }
            if (v === b) { this.cosets[b][x] = y; } else if (v === y) { this.cosets[b][x] = b; } else {
                this.cosets[v][ix] = b;
            }
        }
    }
    getRepresentatives() {
        const represents = new Array<Relation>(this.cosets.length);
        represents[0] = [];
        for (let a = 0; a < this.cosets.length; a++) {
            console.assert(represents[a] !== undefined);
            for (let x = 0; x < this.letters; x++) {
                const next = this.cosets[a][x];
                if (!represents[next]) {
                    represents[next] = represents[a].slice(0);
                    represents[next].push(x);
                }
            }
        }
        return represents;
    }
    findCoset(w: Relation) {
        let coset = 0;
        w = w.slice(0);
        let x: number;
        while ((x = w.shift()) !== undefined) {
            coset = this.cosets[coset][x];
        }
        return coset;
    }
}
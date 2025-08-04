class Perlin3 {
    _p = new Uint8Array(512);
    constructor(srand) {
        const p = this._p;
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        let i = 255;
        while (i--) {
            let j = srand.nexti(i);
            let x = p[i];
            p[i] = p[j];
            p[j] = x;
        }
        for (i = 0; i < 256; i++) {
            p[i + 256] = p[i];
        }
    }
    value(x, y, z) {
        const p = this._p;
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        function _fade(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }
        let u = _fade(x);
        let v = _fade(y);
        let w = _fade(z);
        function _lerp(t, a, b) {
            return a + t * (b - a);
        }
        function _grad(hash, x, y, z) {
            let h = hash & 15;
            let u = h < 8 ? x : y;
            let v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
            return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
        }
        let A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        let B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
        return _lerp(w, _lerp(v, _lerp(u, _grad(p[AA], x, y, z), _grad(p[BA], x - 1, y, z)), _lerp(u, _grad(p[AB], x, y - 1, z), _grad(p[BB], x - 1, y - 1, z))), _lerp(v, _lerp(u, _grad(p[AA + 1], x, y, z - 1), _grad(p[BA + 1], x - 1, y, z - 1)), _lerp(u, _grad(p[AB + 1], x, y - 1, z - 1), _grad(p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

export { Perlin3 };
//# sourceMappingURL=noise.js.map

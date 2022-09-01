namespace tesserxel {
    export namespace math {
        export const _180 = Math.PI;
        export const _30 = Math.PI / 6;
        export const _60 = Math.PI / 3;
        export const _45 = Math.PI / 4;
        export const _90 = Math.PI / 2;
        export const _360 = Math.PI * 2;
        export const _DEG2RAD = Math.PI / 180;
        export const _RAD2DEG = 180 / Math.PI;
        export class Srand {
            _seed: number;
            constructor(seed: number) {
                this._seed = seed;
            }
            set(seed: number) {
                this._seed = seed;
            }
            /** return a random float in [0,1] */
            nextf() {
                let t = this._seed += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
            /** return a random int of [0,n-1] if n is given, else range is same as int */
            nexti(n?: number) {
                let t = this._seed += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return (n === undefined) ? ((t ^ t >>> 14) >>> 0) : ((t ^ t >>> 14) >>> 0) % n;
            }
        }
    }
}
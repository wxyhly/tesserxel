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
        // https://github.com/mrdoob/three.js/blob/dev/src/math/MathUtils.js
        const _lut = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'];
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
        export function generateUUID() {
            const d0 = Math.random() * 0xffffffff | 0;
            const d1 = Math.random() * 0xffffffff | 0;
            const d2 = Math.random() * 0xffffffff | 0;
            const d3 = Math.random() * 0xffffffff | 0;
            const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
                _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
                _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
                _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];
            // .toLowerCase() here flattens concatenated strings to save heap memory space.
            return uuid.toLowerCase();

        }
        // from cannon.js: src/utils/pool.js
        export abstract class Pool<T> {
            objects: T[] = [];
            abstract constructObject(): T;
            pop() {
                if (this.objects.length === 0) {
                    return this.constructObject();
                } else {
                    return this.objects.pop();
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
        export class Vec2Pool extends Pool<Vec2>{
            constructObject() { return new Vec2; }
        }
        export class Vec3Pool extends Pool<Vec3>{
            constructObject() { return new Vec3; }
        }
        export class Vec4Pool extends Pool<Vec4>{
            constructObject() { return new Vec4; }
        }
        export class BivecPool extends Pool<Bivec>{
            constructObject() { return new Bivec; }
        }
        export class Mat2Pool extends Pool<Mat2>{
            constructObject() { return new Mat2; }
        }
        export class Mat3Pool extends Pool<Mat3>{
            constructObject() { return new Mat3; }
        }
        export class Mat4Pool extends Pool<Mat4>{
            constructObject() { return new Mat4; }
        }
        export class QuaternionPool extends Pool<Quaternion>{
            constructObject() { return new Quaternion; }
        }
        export const vec2Pool = new Vec2Pool;
        export const vec3Pool = new Vec3Pool;
        export const vec4Pool = new Vec4Pool;
        export const bivecPool = new BivecPool;
        export const mat2Pool = new Mat2Pool;
        export const mat3Pool = new Mat3Pool;
        export const mat4Pool = new Mat4Pool;
        export const qPool = new QuaternionPool;
    }
}
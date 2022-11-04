export function toIndexbuffer(srcArr: Float32Array, dstArr: number[], dstIdxArr: number[], stride: number) {
    for (let i = 0, l = srcArr.length; i < l; i += stride) {
        let idx = indexOf(srcArr, i, dstArr, 4);
        if (idx === -1) {
            idx = dstArr.length;
            for (let q = 0; q < stride; q++) {
                dstArr.push(srcArr[i + q]);
            }
        }
        idx >>= 2;
        dstIdxArr.push(idx);
    }
}
export function indexOf(
    srcArr: Float32Array, srcIdx: number, dstArr: number[], stride: number
) {
    for (let i = 0, j = 0, l = dstArr.length; i < l; i += stride, j++) {
        let same = true;
        for (let q = 0; q < stride; q++) {
            same &&= srcArr[srcIdx + q] === dstArr[i + q];
        }
        if (same) {
            return i;
        }
    }
    return -1;
}

export function toNonIndex(srcArr: Float32Array, idxArr: Uint32Array, dstArr: Float32Array, stride: number) {
    let ptr = 0;
    for (let i = 0, l = idxArr.length; i < l; i++) {
        let idx = idxArr[i] * stride;
        for (let q = 0; q < stride; q++) {
            dstArr[ptr++] = srcArr[idx + q];
        }
    }
}
function toIndexbuffer(srcArr, dstArr, dstIdxArr, stride) {
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
function indexOf(srcArr, srcIdx, dstArr, stride) {
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
function toNonIndex(srcArr, idxArr, dstArr, stride) {
    let ptr = 0;
    for (let i = 0, l = idxArr.length; i < l; i++) {
        let idx = idxArr[i] * stride;
        for (let q = 0; q < stride; q++) {
            dstArr[ptr++] = srcArr[idx + q];
        }
    }
}

export { indexOf, toIndexbuffer, toNonIndex };
//# sourceMappingURL=index.js.map

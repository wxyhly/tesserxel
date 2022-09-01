namespace tesserxel {
    export namespace mesh {
        /** Tetramesh store 4D mesh as tetrahedral list
         *  Each tetrahedral uses four vertices in the position list
         */
        export interface TetraMesh {
            position: Float32Array;
            normal: Float32Array;
            uvw?: Float32Array;
            tetraCount?: number;
        }
        export namespace tetra {
            export let tesseract: TetraMesh = {
                position: new Float32Array([
                    1, 1, 1, 1,
                    1, 1, -1, -1,
                    1, -1, -1, 1,
                    1, -1, 1, -1,

                    1, 1, -1, -1,
                    1, -1, -1, -1,
                    1, -1, -1, 1,
                    1, -1, 1, -1,

                    1, -1, 1, 1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    1, -1, 1, -1,

                    1, 1, -1, -1,
                    1, 1, 1, 1,
                    1, 1, 1, -1,
                    1, -1, 1, -1,

                    1, 1, -1, -1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    1, 1, -1, 1,

                    //x-
                    -1, 1, -1, -1,
                    -1, 1, 1, 1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,

                    -1, -1, -1, -1,
                    -1, 1, -1, -1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,

                    -1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,

                    -1, 1, 1, 1,
                    -1, 1, -1, -1,
                    -1, 1, 1, -1,
                    -1, -1, 1, -1,

                    -1, 1, 1, 1,
                    -1, 1, -1, -1,
                    -1, -1, -1, 1,
                    -1, 1, -1, 1,

                    //y+
                    1, 1, -1, -1,
                    1, 1, 1, 1,
                    -1, 1, -1, 1,
                    -1, 1, 1, -1,

                    -1, 1, -1, -1,
                    1, 1, -1, -1,
                    -1, 1, -1, 1,
                    -1, 1, 1, -1,

                    1, 1, 1, 1,
                    -1, 1, 1, 1,
                    -1, 1, -1, 1,
                    -1, 1, 1, -1,

                    1, 1, 1, 1,
                    1, 1, -1, -1,
                    1, 1, 1, -1,
                    -1, 1, 1, -1,

                    1, 1, 1, 1,
                    1, 1, -1, -1,
                    -1, 1, -1, 1,
                    1, 1, -1, 1,

                    //y-
                    1, -1, 1, 1,
                    1, -1, -1, -1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,
                    1, -1, -1, -1,
                    -1, -1, -1, -1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,
                    -1, -1, 1, 1,
                    1, -1, 1, 1,
                    -1, -1, -1, 1,
                    -1, -1, 1, -1,
                    1, -1, -1, -1,
                    1, -1, 1, 1,
                    1, -1, 1, -1,
                    -1, -1, 1, -1,
                    1, -1, -1, -1,
                    1, -1, 1, 1,
                    -1, -1, -1, 1,
                    1, -1, -1, 1,
                    //z+
                    1, 1, 1, 1,
                    1, -1, 1, -1,
                    -1, -1, 1, 1,
                    -1, 1, 1, -1,
                    1, -1, 1, -1,
                    -1, -1, 1, -1,
                    -1, -1, 1, 1,
                    -1, 1, 1, -1,
                    -1, 1, 1, 1,
                    1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, 1, -1,
                    1, -1, 1, -1,
                    1, 1, 1, 1,
                    1, 1, 1, -1,
                    -1, 1, 1, -1,
                    1, -1, 1, -1,
                    1, 1, 1, 1,
                    -1, -1, 1, 1,
                    1, -1, 1, 1,
                    //z-
                    1, -1, -1, -1,
                    1, 1, -1, 1,
                    -1, -1, -1, 1,
                    -1, 1, -1, -1,
                    -1, -1, -1, -1,
                    1, -1, -1, -1,
                    -1, -1, -1, 1,
                    -1, 1, -1, -1,
                    1, 1, -1, 1,
                    -1, 1, -1, 1,
                    -1, -1, -1, 1,
                    -1, 1, -1, -1,
                    1, 1, -1, 1,
                    1, -1, -1, -1,
                    1, 1, -1, -1,
                    -1, 1, -1, -1,
                    1, 1, -1, 1,
                    1, -1, -1, -1,
                    -1, -1, -1, 1,
                    1, -1, -1, 1,
                    //w+
                    1, -1, -1, 1,
                    1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    -1, -1, -1, 1,
                    1, -1, -1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    -1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    1, 1, -1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    -1, -1, 1, 1,
                    1, -1, 1, 1,

                    //w-
                    1, 1, 1, -1,
                    1, -1, -1, -1,
                    -1, -1, 1, -1,
                    -1, 1, -1, -1,
                    1, -1, -1, -1,
                    -1, -1, -1, -1,
                    -1, -1, 1, -1,
                    -1, 1, -1, -1,
                    -1, 1, 1, -1,
                    1, 1, 1, -1,
                    -1, -1, 1, -1,
                    -1, 1, -1, -1,
                    1, -1, -1, -1,
                    1, 1, 1, -1,
                    1, 1, -1, -1,
                    -1, 1, -1, -1,
                    1, -1, -1, -1,
                    1, 1, 1, -1,
                    -1, -1, 1, -1,
                    1, -1, 1, -1,
                ]),
                normal: new Float32Array([
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1,
                    0, 0, 0, -1
                ]),
                uvw: new Float32Array([
                    1, 1, 1, 0,
                    1, -1, -1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    1, -1, -1, 0,
                    -1, -1, -1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    -1, 1, 1, 0,
                    1, 1, 1, 0,
                    -1, -1, 1, 0,
                    -1, 1, -1, 0,
                    1, -1, -1, 0,
                    1, 1, 1, 0,
                    1, 1, -1, 0,
                    -1, 1, -1, 0,
                    1, -1, -1, 0,
                    1, 1, 1, 0,
                    -1, -1, 1, 0,
                    1, -1, 1, 0,
                    //x-
                    1, -1, -1, 1,
                    1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    -1, -1, -1, 1,
                    1, -1, -1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    -1, 1, 1, 1,
                    -1, -1, 1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    1, 1, -1, 1,
                    -1, 1, -1, 1,
                    1, 1, 1, 1,
                    1, -1, -1, 1,
                    -1, -1, 1, 1,
                    1, -1, 1, 1,

                    //y+
                    1, -1, -1, 2,
                    1, 1, 1, 2,
                    -1, -1, 1, 2,
                    -1, 1, -1, 2,
                    -1, -1, -1, 2,
                    1, -1, -1, 2,
                    -1, -1, 1, 2,
                    -1, 1, -1, 2,
                    1, 1, 1, 2,
                    -1, 1, 1, 2,
                    -1, -1, 1, 2,
                    -1, 1, -1, 2,
                    1, 1, 1, 2,
                    1, -1, -1, 2,
                    1, 1, -1, 2,
                    -1, 1, -1, 2,
                    1, 1, 1, 2,
                    1, -1, -1, 2,
                    -1, -1, 1, 2,
                    1, -1, 1, 2,

                    //y-
                    1, 1, 1, 3,
                    1, -1, -1, 3,
                    -1, -1, 1, 3,
                    -1, 1, -1, 3,
                    1, -1, -1, 3,
                    -1, -1, -1, 3,
                    -1, -1, 1, 3,
                    -1, 1, -1, 3,
                    -1, 1, 1, 3,
                    1, 1, 1, 3,
                    -1, -1, 1, 3,
                    -1, 1, -1, 3,
                    1, -1, -1, 3,
                    1, 1, 1, 3,
                    1, 1, -1, 3,
                    -1, 1, -1, 3,
                    1, -1, -1, 3,
                    1, 1, 1, 3,
                    -1, -1, 1, 3,
                    1, -1, 1, 3,
                    //z+
                    1, 1, 1, 4,
                    1, -1, -1, 4,
                    -1, -1, 1, 4,
                    -1, 1, -1, 4,
                    1, -1, -1, 4,
                    -1, -1, -1, 4,
                    -1, -1, 1, 4,
                    -1, 1, -1, 4,
                    -1, 1, 1, 4,
                    1, 1, 1, 4,
                    -1, -1, 1, 4,
                    -1, 1, -1, 4,
                    1, -1, -1, 4,
                    1, 1, 1, 4,
                    1, 1, -1, 4,
                    -1, 1, -1, 4,
                    1, -1, -1, 4,
                    1, 1, 1, 4,
                    -1, -1, 1, 4,
                    1, -1, 1, 4,
                    //z-
                    1, -1, -1, 5,
                    1, 1, 1, 5,
                    -1, -1, 1, 5,
                    -1, 1, -1, 5,
                    -1, -1, -1, 5,
                    1, -1, -1, 5,
                    -1, -1, 1, 5,
                    -1, 1, -1, 5,
                    1, 1, 1, 5,
                    -1, 1, 1, 5,
                    -1, -1, 1, 5,
                    -1, 1, -1, 5,
                    1, 1, 1, 5,
                    1, -1, -1, 5,
                    1, 1, -1, 5,
                    -1, 1, -1, 5,
                    1, 1, 1, 5,
                    1, -1, -1, 5,
                    -1, -1, 1, 5,
                    1, -1, 1, 5,
                    //w+
                    1, -1, -1, 6,
                    1, 1, 1, 6,
                    -1, -1, 1, 6,
                    -1, 1, -1, 6,
                    -1, -1, -1, 6,
                    1, -1, -1, 6,
                    -1, -1, 1, 6,
                    -1, 1, -1, 6,
                    1, 1, 1, 6,
                    -1, 1, 1, 6,
                    -1, -1, 1, 6,
                    -1, 1, -1, 6,
                    1, 1, 1, 6,
                    1, -1, -1, 6,
                    1, 1, -1, 6,
                    -1, 1, -1, 6,
                    1, 1, 1, 6,
                    1, -1, -1, 6,
                    -1, -1, 1, 6,
                    1, -1, 1, 6,

                    //w-
                    1, 1, 1, 7,
                    1, -1, -1, 7,
                    -1, -1, 1, 7,
                    -1, 1, -1, 7,
                    1, -1, -1, 7,
                    -1, -1, -1, 7,
                    -1, -1, 1, 7,
                    -1, 1, -1, 7,
                    -1, 1, 1, 7,
                    1, 1, 1, 7,
                    -1, -1, 1, 7,
                    -1, 1, -1, 7,
                    1, -1, -1, 7,
                    1, 1, 1, 7,
                    1, 1, -1, 7,
                    -1, 1, -1, 7,
                    1, -1, -1, 7,
                    1, 1, 1, 7,
                    -1, -1, 1, 7,
                    1, -1, 1, 7,
                ]),
                tetraCount: 40
            };
            export let hexadecachoron: TetraMesh = {
                position: new Float32Array([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    0, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    0, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                    0, -1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    0, -1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,


                    0, 1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    -1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    0, 1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                    -1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    0, -1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, -1,
                    0, -1, 0, 0,
                    -1, 0, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, 1,
                    -1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, -1, 0,
                    0, 0, 0, -1,

                ]),
                normal: new Float32Array([
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, 0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, 0.5, -0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, 0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,
                    0.5, 0.5, -0.5, -0.5,

                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, 0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, 0.5, -0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, 0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,
                    0.5, -0.5, -0.5, -0.5,


                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, 0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, 0.5, -0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, 0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,
                    -0.5, 0.5, -0.5, -0.5,

                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, 0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, 0.5, -0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, 0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                    -0.5, -0.5, -0.5, -0.5,
                ]),
                uvw: new Float32Array([
                    0, 0, 0, 0,
                    1, 1, 0, 0,
                    1, 0, 1, 0,
                    0, 1, 1, 0,
                    0, 0, 0, 1,
                    1, 1, 0, 1,
                    1, 0, 1, 1,
                    0, 1, 1, 1,
                    0, 0, 0, 2,
                    1, 1, 0, 2,
                    1, 0, 1, 2,
                    0, 1, 1, 2,
                    0, 0, 0, 3,
                    1, 1, 0, 3,
                    1, 0, 1, 3,
                    0, 1, 1, 3,
                    0, 0, 0, 4,
                    1, 1, 0, 4,
                    1, 0, 1, 4,
                    0, 1, 1, 4,
                    0, 0, 0, 5,
                    1, 1, 0, 5,
                    1, 0, 1, 5,
                    0, 1, 1, 5,
                    0, 0, 0, 6,
                    1, 1, 0, 6,
                    1, 0, 1, 6,
                    0, 1, 1, 6,
                    0, 0, 0, 7,
                    1, 1, 0, 7,
                    1, 0, 1, 7,
                    0, 1, 1, 7,
                    0, 0, 0, 8,
                    1, 1, 0, 8,
                    1, 0, 1, 8,
                    0, 1, 1, 8,
                    0, 0, 0, 9,
                    1, 1, 0, 9,
                    1, 0, 1, 9,
                    0, 1, 1, 9,
                    0, 0, 0, 10,
                    1, 1, 0, 10,
                    1, 0, 1, 10,
                    0, 1, 1, 10,
                    0, 0, 0, 11,
                    1, 1, 0, 11,
                    1, 0, 1, 11,
                    0, 1, 1, 11,
                    0, 0, 0, 12,
                    1, 1, 0, 12,
                    1, 0, 1, 12,
                    0, 1, 1, 12,
                    0, 0, 0, 13,
                    1, 1, 0, 13,
                    1, 0, 1, 13,
                    0, 1, 1, 13,
                    0, 0, 0, 14,
                    1, 1, 0, 14,
                    1, 0, 1, 14,
                    0, 1, 1, 14,
                    0, 0, 0, 15,
                    1, 1, 0, 15,
                    1, 0, 1, 15,
                    0, 1, 1, 15,
                ]),
                tetraCount: 16
            };
            export function glome(radius:number, xySegment: number, zwSegment: number, lattitudeSegment: number) {
                if (xySegment < 3) xySegment = 3;
                if (zwSegment < 3) zwSegment = 3;
                if (lattitudeSegment < 1) lattitudeSegment = 1;
                return parametricSurface((uvw, pos, norm) => {
                    let u = uvw.x * math._360;
                    let v = uvw.y * math._360;
                    let w = uvw.z * math._90;
                    let cos = Math.cos(w) * radius;
                    let sin = Math.sin(w) * radius;
                    pos.set(-Math.cos(u) * cos, Math.sin(u) * cos, Math.cos(v) * sin, Math.sin(v) * sin);
                    norm.copy(pos);
                }, xySegment, zwSegment, lattitudeSegment);
            }
            export function tiger(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number, secondaryRadius: number, secondarySegment: number) {
                if (xySegment < 3) xySegment = 3;
                if (zwSegment < 3) zwSegment = 3;
                if (secondarySegment < 3) secondarySegment = 3;
                return parametricSurface((uvw, pos, norm) => {

                    let u = uvw.x * math._360;
                    let v = uvw.y * math._360;
                    let w = uvw.z * math._360;
                    let su = Math.sin(w);
                    let cu = Math.cos(w);

                    pos.set(
                        (su * secondaryRadius + xyRadius) * Math.sin(u),
                        (su * secondaryRadius + xyRadius) * Math.cos(u),
                        (cu * secondaryRadius + zwRadius) * Math.sin(v),
                        (cu * secondaryRadius + zwRadius) * Math.cos(v),
                    );
                    norm.set(
                        su * Math.sin(u),
                        su * Math.cos(u),
                        cu * Math.sin(v),
                        cu * Math.cos(v),
                    );
                }, xySegment, zwSegment, secondarySegment);
            }
            export function parametricSurface(
                fn: (inputUVW: math.Vec3, outputPosition: math.Vec4, outputNormal: math.Vec4) => void,
                uSegment: number, vSegment: number, wSegment: number
            ): TetraMesh {
                if (uSegment < 1) uSegment = 1;
                if (vSegment < 1) vSegment = 1;
                if (wSegment < 1) wSegment = 1;
                let tetraCount = uSegment * vSegment * wSegment * 5;
                let arraySize = tetraCount << 4;
                uSegment++; vSegment++; wSegment++;
                let vw_seg = vSegment * wSegment;
                let uvw_seg = uSegment * vw_seg;
                let positions = new Float32Array((uvw_seg) << 2);
                let normals = new Float32Array((uvw_seg) << 2);
                let uvws = new Float32Array((uvw_seg) << 2);
                let position = new Float32Array(arraySize);
                let normal = new Float32Array(arraySize);
                let uvw = new Float32Array(arraySize);
                let inputUVW = new math.Vec3;
                let idxbuffer = new Uint32Array(8);
                let outputVertex = new math.Vec4;
                let outputNormal = new math.Vec4;
                let ptr = 0;
                let idxPtr = 0;
                function pushIdx(i: number) {
                    position[idxPtr++] = positions[i];
                    position[idxPtr++] = positions[i + 1];
                    position[idxPtr++] = positions[i + 2];
                    position[idxPtr++] = positions[i + 3];
                    idxPtr -= 4;
                    normal[idxPtr++] = normals[i];
                    normal[idxPtr++] = normals[i + 1];
                    normal[idxPtr++] = normals[i + 2];
                    normal[idxPtr++] = normals[i + 3];
                    idxPtr -= 4;
                    uvw[idxPtr++] = uvws[i];
                    uvw[idxPtr++] = uvws[i + 1];
                    uvw[idxPtr++] = uvws[i + 2];
                    uvw[idxPtr++] = uvws[i + 3];
                }
                function pushTetra(a: number, b: number, c: number, d: number) {
                    a = idxbuffer[a];
                    b = idxbuffer[b];
                    c = idxbuffer[c];
                    d = idxbuffer[d];
                    function same(offset1: number, offset2: number) {
                        return positions[offset1] === positions[offset2] &&
                            positions[offset1 + 1] === positions[offset2 + 1] &&
                            positions[offset1 + 2] === positions[offset2 + 2] &&
                            positions[offset1 + 3] === positions[offset2 + 3];
                    }
                    if (!(same(a, b) || same(a, c) || same(a, d) || same(b, c) || same(b, d))){
                        pushIdx(a); pushIdx(b); pushIdx(c); pushIdx(d);
                    }
                }
                for (let u_index = 0; u_index < uSegment; u_index++) {
                    inputUVW.x = u_index / (uSegment - 1);
                    let u_offset = vSegment * u_index;
                    for (let v_index = 0; v_index < vSegment; v_index++) {
                        inputUVW.y = v_index / (vSegment - 1);
                        let v_offset = wSegment * (v_index + u_offset);
                        for (let w_index = 0; w_index < wSegment; w_index++) {
                            inputUVW.z = w_index / (wSegment - 1);
                            fn(inputUVW, outputVertex, outputNormal);
                            positions[ptr++] = outputVertex.x;
                            positions[ptr++] = outputVertex.y;
                            positions[ptr++] = outputVertex.z;
                            positions[ptr++] = outputVertex.w;
                            ptr -= 4;
                            normals[ptr++] = outputNormal.x;
                            normals[ptr++] = outputNormal.y;
                            normals[ptr++] = outputNormal.z;
                            normals[ptr++] = outputNormal.w;
                            ptr -= 4;
                            uvws[ptr++] = inputUVW.x;
                            uvws[ptr++] = inputUVW.y;
                            uvws[ptr++] = inputUVW.z;
                            uvws[ptr++] = 0;
                            if (u_index && v_index && w_index) {
                                let offset = w_index + v_offset;
                                idxbuffer[0] = offset << 2;
                                idxbuffer[1] = offset - 1 << 2;
                                idxbuffer[2] = offset - wSegment << 2;
                                idxbuffer[3] = offset - wSegment - 1 << 2;
                                idxbuffer[4] = offset - vw_seg << 2;
                                idxbuffer[5] = offset - vw_seg - 1 << 2;
                                idxbuffer[6] = offset - vw_seg - wSegment << 2;
                                idxbuffer[7] = offset - vw_seg - wSegment - 1 << 2;
                                pushTetra(0, 1, 2, 4);
                                pushTetra(1, 5, 7, 4);
                                pushTetra(1, 2, 7, 3);
                                pushTetra(4, 6, 7, 2);
                                pushTetra(1, 2, 4, 7);
                            }
                        }
                    }
                }
                return { position, normal, uvw, tetraCount };
            }
            export function convexhull(points: math.Vec4[]) {
                // todo: fix a random dead loop bug
                if (points.length < 5) return;
                points.sort((a, b) => Math.random() - 0.5);
                let _vec41 = new math.Vec4();
                let _vec42 = new math.Vec4();
                let _vec43 = new math.Vec4();
                let _vec44 = new math.Vec4();
                // let _vec45 = new math.Vec4();
                let _mat4 = new math.Mat4();
                let determinant = 0;
                let nobreak = true;
                let a = 0, b = 1, c = 2, d = 3, e = 4;
                let epsilon = 1e-10;
                for (a = 0; a < points.length && nobreak; a++) {
                    for (b = a + 1; b < points.length && nobreak; b++) {
                        for (c = b + 1; c < points.length && nobreak; c++) {
                            for (d = c + 1; d < points.length && nobreak; d++) {
                                for (e = d + 1; e < points.length; e++) {
                                    determinant = det(a, b, c, d, e);
                                    if (Math.abs(determinant) > epsilon) {
                                        nobreak = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (determinant === 0) return;
                let temp: math.Vec4; b--; c--; d--; a--;
                temp = points[0]; points[0] = points[a]; points[a] = temp;
                if (b === 0) b = a; if (c === 0) c = a; if (d === 0) d = a; if (e === 0) e = a;
                temp = points[1]; points[1] = points[b]; points[b] = temp;
                if (c === 1) c = b; if (d === 1) d = b; if (e === 1) e = b;
                temp = points[2]; points[2] = points[c]; points[c] = temp;
                if (d === 2) d = c; if (e === 2) e = c;
                temp = points[3]; points[3] = points[d]; points[d] = temp;
                if (e === 3) e = d;
                temp = points[4]; points[4] = points[e]; points[e] = temp;
                let tetraCount = 5; // indices.length === tetraCount * 4 always is true
                console.log(determinant);
                console.log(det(0, 1, 2, 3, 4));
                let indices = det(0, 1, 2, 3, 4) > 0 ?
                    [1, 2, 3, 4, 2, 0, 3, 4, 0, 1, 3, 4, 1, 0, 2, 4, 0, 1, 2, 3]
                    :
                    [2, 1, 3, 4, 0, 2, 3, 4, 1, 0, 3, 4, 0, 1, 2, 4, 1, 0, 2, 3];
                function det(a: number, b: number, c: number, d: number, e: number) {
                    let p = points[e];
                    return _mat4.augVec4set(
                        _vec41.subset(p, points[a]),
                        _vec42.subset(p, points[b]),
                        _vec43.subset(p, points[c]),
                        _vec44.subset(p, points[d]),
                    ).det();
                }
                for (let cursor = 5; cursor < points.length; cursor++) {
                    let newIndices = [];
                    // borderformat [v1,v2,v3,flag], v1>v2>v3, 
                    // flag: 1 orientation +, 0 orientation -, 2 duplicate remove
                    let border: number[][] = [];
                    function checkBorder(a: number, b: number, c: number) {
                        let item = a > b ? b > c ? [a, b, c, 1] : a > c ? [a, c, b, 0] : [c, a, b, 1] :
                            a > c ? [b, a, c, 0] : b > c ? [b, c, a, 1] : [c, b, a, 0];
                        let found = false;
                        for (let i of border) {
                            if (i[0] === item[0] && i[1] === item[1] && i[2] === item[2]) {
                                i[3] = 2;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            border.push(item);
                        }
                    }
                    for (let cell = 0; cell < tetraCount; cell++) {
                        let a = indices[cell << 2];
                        let b = indices[(cell << 2) + 1];
                        let c = indices[(cell << 2) + 2];
                        let d = indices[(cell << 2) + 3];
                        let determinant = det(a, b, c, d, cursor);
                        if (determinant < epsilon) {
                            checkBorder(b, c, d);
                            checkBorder(c, a, d);
                            checkBorder(a, b, d);
                            checkBorder(b, a, c);
                        } else {
                            newIndices.push(a, b, c, d);
                        }
                    }
                    for (let b of border) {
                        if (b[3] === 2) continue;
                        else if (b[3] === 0) newIndices.push(b[0], b[1], b[2], cursor);
                        else if (b[3] === 1) newIndices.push(b[0], b[2], b[1], cursor);
                    }
                    indices = newIndices;
                    tetraCount = indices.length >> 2;
                }
                let position = new Float32Array(tetraCount << 4);
                let count = 0;
                for (let p = 0; p < tetraCount; p++) {
                    points[indices[(p << 2)]].writeBuffer(position, count); count += 4;
                    points[indices[(p << 2) + 1]].writeBuffer(position, count); count += 4;
                    points[indices[(p << 2) + 2]].writeBuffer(position, count); count += 4;
                    points[indices[(p << 2) + 3]].writeBuffer(position, count); count += 4;
                }
                return {
                    position,
                    tetraCount
                }
            }
            export function duocone(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * math._360 / xySegment;
                    ps.push(new math.Vec4(xyRadius * Math.cos(ii), xyRadius * Math.sin(ii)));
                }
                for (let i = 0; i < zwSegment; i++) {
                    let ii = i * math._360 / zwSegment;
                    ps.push(new math.Vec4(0, 0, zwRadius * Math.cos(ii), zwRadius * Math.sin(ii)));
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }

            export function duocylinder(xyRadius: number, xySegment: number, zwRadius: number, zwSegment: number) {
                let ps = [];
                for (let i = 0; i < xySegment; i++) {
                    let ii = i * math._360 / xySegment;
                    for (let j = 0; j < zwSegment; j++) {
                        let jj = j * math._360 / zwSegment;
                        ps.push(new math.Vec4(
                            xyRadius * Math.cos(ii), xyRadius * Math.sin(ii),
                            zwRadius * Math.cos(jj), zwRadius * Math.sin(jj)
                        ));
                    }
                }
                return tesserxel.mesh.tetra.convexhull(ps);
            }
        }
    }
}
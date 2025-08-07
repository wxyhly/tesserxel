import { bivecPool } from "../math/algebra/bivec.js";
import { Vec4, vec4Pool } from "../math/algebra/vec4.js";

// Convex Collision Detection algorithms (GJK Distance + EPA)
        const maxEpaStep = 16;
        const maxGjkStep = 32;
        type Convex = Vec4[];
        function support(c: Convex, dir: Vec4) {
            let support = -Infinity;
            let point: Vec4;
            for (let p of c) {
                let value = p.dot(dir);
                if (value > support) {
                    support = value;
                    point = p;
                }
            }
            return point!;
        }
        function supportNeg(c: Convex, dir: Vec4) {
            let support = -Infinity;
            let point: Vec4;
            for (let p of c) {
                let value = -p.dot(dir);
                if (value > support) {
                    support = value;
                    point = p;
                }
            }
            return point!;
        }
        function supportDiff(c1: Convex, c2: Convex, dir: Vec4) {
            if (!dir) {
                console.error("Convex Collision Detector: Undefined support direction");
            }
            let support = -Infinity;
            let point1: Vec4;
            let point2: Vec4;
            for (let p of c1) {
                let value = p.dot(dir);
                if (value > support) {
                    support = value;
                    point1 = p;
                }
            }
            support = -Infinity;
            for (let p of c2) {
                let value = -p.dot(dir);
                if (value > support) {
                    support = value;
                    point2 = p;
                }
            }
            return [point1!, point2!];
        }
        function supportDiffTest(c1: Convex, c2: Convex, dir: Vec4) {
            let support1 = -Infinity;
            let point1: Vec4;
            let point2: Vec4;
            for (let p of c1) {
                let value = p.dot(dir);
                if (value > support1) {
                    support1 = value;
                    point1 = p;
                }
            }
            let support2 = -Infinity;
            for (let p of c2) {
                let value = -p.dot(dir);
                if (value > support2) {
                    support2 = value;
                    point2 = p;
                }
            }
            if (support1 + support2 < 0) return [];
            return [point1!, point2!];
        }
        // /** get closest point on line segment ab */
        // function closestToOrigin2(a: Vec4, b: Vec4) {
        //     let adb = a.dot(b);
        //     let la = b.normsqr() - adb; if (la < 0) return b;
        //     let lb = a.normsqr() - adb; if (lb < 0) return a;
        //     return vec4Pool.pop().set().addmulfs(a, la).addmulfs(b, lb).divfs(la + lb);
        // }
        // /** get line ab's normal pointing to origin, 20 muls */
        // function normalToOrigin2(out: Vec4, a: Vec4, b: Vec4) {
        //     let adb = a.dot(b);
        //     let la = b.normsqr() - adb;
        //     let lb = a.normsqr() - adb;
        //     return out.set().addmulfs(a, -la).addmulfs(b, -lb);
        // }
        // /** get plane abc's normal point to origin, 36 muls */
        // function normalToOrigin3(out: Vec4, a: Vec4, b: Vec4, c: Vec4) {
        //     let vec = vec4Pool.pop();
        //     let biv = bivecPool.pop().wedgevvset(
        //         out.subset(b, a), vec.subset(c, a)
        //     );
        //     vec.pushPool();
        //     out.wedgevbset(a, biv).wedgevbset(out, biv);
        //     biv.pushPool();
        //     return out;
        // }
        function getClosestPointOrNormal2(a: Vec4, b: Vec4) {
            let adb = a.dot(b);
            let la = b.normsqr() - adb; if (la < 0) return b;
            let lb = a.normsqr() - adb; if (lb < 0) return a;
            return vec4Pool.pop().set().addmulfs(a, -la).addmulfs(b, -lb);
        }
        function getClosestPointOrNormal3(a: Vec4, b: Vec4, c: Vec4) {
            let ca = vec4Pool.pop().subset(a, c);
            let cb = vec4Pool.pop().subset(b, c);
            if (c.dot(ca) > 0 && c.dot(cb) > 0) {
                vec4Pool.push(ca, cb);
                return [c];
            }
            let biv = bivecPool.pop().wedgevvset(ca, cb);
            if (ca.dotbset(ca, biv).dot(c) > 0) {
                vec4Pool.push(ca, cb);
                return [a, c];
            }
            // cb's sign is not consisted with ca's because of biv = ca x cb
            if (cb.dotbset(cb, biv).dot(c) < 0) {
                vec4Pool.push(ca, cb);
                return [b, c];
            }
            let out = ca;
            out.wedgevbset(a, biv).wedgevbset(out, biv);
            biv.pushPool();
            vec4Pool.push(cb);
            return out;
        }
        function getClosestPointOrNormal4(a: Vec4, b: Vec4, c: Vec4, d: Vec4) {
            let da = vec4Pool.pop().subset(a, d);
            let db = vec4Pool.pop().subset(b, d);
            let dc = vec4Pool.pop().subset(c, d);
            // vertex
            if (d.dot(da) > 0 && d.dot(db) > 0 && d.dot(dc) > 0) {
                vec4Pool.push(da, db, dc);
                return [d];
            }
            // edge
            let dab = bivecPool.pop().wedgevvset(da, db);
            let dbc = bivecPool.pop().wedgevvset(db, dc);
            let dca = bivecPool.pop().wedgevvset(dc, da);
            let temp = vec4Pool.pop();
            if (temp.dotbset(da, dab).dot(d) > 0 && temp.dotbset(da, dca).dot(d) < 0) {
                vec4Pool.push(da, db, dc, temp);
                bivecPool.push(dab, dbc, dca);
                return [a, d];
            }
            if (temp.dotbset(db, dbc).dot(d) > 0 && temp.dotbset(db, dab).dot(d) < 0) {
                vec4Pool.push(da, db, dc, temp);
                bivecPool.push(dab, dbc, dca);
                return [b, d];
            }
            if (temp.dotbset(dc, dca).dot(d) > 0 && temp.dotbset(dc, dbc).dot(d) < 0) {
                vec4Pool.push(da, db, dc, temp);
                bivecPool.push(dab, dbc, dca);
                return [c, d];
            }
            // face
            // dabc is normal vector
            let dabc = vec4Pool.pop().wedgevbset(da, dbc);
            if (temp.wedgevbset(dabc, dab).dot(d) < 0) {
                vec4Pool.push(da, db, dc, dabc, temp);
                bivecPool.push(dab, dbc, dca);
                return [a, b, d];
            }
            if (temp.wedgevbset(dabc, dbc).dot(d) < 0) {
                vec4Pool.push(da, db, dc, dabc, temp);
                bivecPool.push(dab, dbc, dca);
                return [b, c, d];
            }
            if (temp.wedgevbset(dabc, dca).dot(d) < 0) {
                vec4Pool.push(da, db, dc, dabc, temp);
                bivecPool.push(dab, dbc, dca);
                return [a, c, d];
            }
            // new direction is already normal dabc
            // but need to point to origin:
            // dabc.mulfs(-a.dot(dabc));
            // we do it outside of this fn
            // because we need this important orientation information
            // to construct corrected ordered 5-simplex
            vec4Pool.push(da, db, dc, temp);
            bivecPool.push(dab, dbc, dca);
            return dabc;
        }
        function getClosestPoint5(a: Vec4, b: Vec4, c: Vec4, d: Vec4, e: Vec4, reverseOrder: boolean) {
            // about reverseOrder:
            // if reverseOrder == false
            // da^db^dc (dabc) is pointing to outside
            // else dabc is pointing to e (inside)

            let ea = vec4Pool.pop().subset(a, e);
            let eb = vec4Pool.pop().subset(b, e);
            let ec = vec4Pool.pop().subset(c, e);
            let ed = vec4Pool.pop().subset(d, e);
            // vertex
            if (e.dot(ea) > 0 && e.dot(eb) > 0 && e.dot(ec) > 0 && e.dot(ed) > 0) {
                vec4Pool.push(ea, eb, ec, ed);
                return [e];
            }
            // edge
            let eab = bivecPool.pop().wedgevvset(ea, eb);
            let ebc = bivecPool.pop().wedgevvset(eb, ec);
            let eac = bivecPool.pop().wedgevvset(ea, ec);
            let ead = bivecPool.pop().wedgevvset(ea, ed);
            let ebd = bivecPool.pop().wedgevvset(eb, ed);
            let ecd = bivecPool.pop().wedgevvset(ec, ed);
            let temp = vec4Pool.pop();
            if (temp.dotbset(ea, eab).dot(e) > 0 && temp.dotbset(ea, eac).dot(e) > 0 && temp.dotbset(ea, ead).dot(e) > 0) {
                vec4Pool.push(ea, eb, ec, ed, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [a, e];
            }
            if (temp.dotbset(eb, eab).dot(e) < 0 && temp.dotbset(eb, ebc).dot(e) > 0 && temp.dotbset(eb, ebd).dot(e) > 0) {
                vec4Pool.push(ea, eb, ec, ed, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [b, e];
            }
            if (temp.dotbset(ec, eac).dot(e) < 0 && temp.dotbset(ec, ebc).dot(e) < 0 && temp.dotbset(ec, ecd).dot(e) > 0) {
                vec4Pool.push(ea, eb, ec, ed, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [c, e];
            }
            if (temp.dotbset(ed, ead).dot(e) < 0 && temp.dotbset(ed, ebd).dot(e) < 0 && temp.dotbset(ed, ecd).dot(e) < 0) {
                vec4Pool.push(ea, eb, ec, ed, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [d, e];
            }
            // face
            // normal vectors for 4 cells, be careful with directions
            //  dabc
            let eabc = vec4Pool.pop().wedgevbset(ea, ebc); // -
            let eabd = vec4Pool.pop().wedgevbset(ea, ebd); // +
            let eacd = vec4Pool.pop().wedgevbset(ea, ecd); // -
            let ebcd = vec4Pool.pop().wedgevbset(eb, ecd); // +
            if (temp.wedgevbset(eabc, eab).dot(e) < 0 && temp.wedgevbset(eabd, eab).dot(e) < 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [a, b, e];
            }
            if (temp.wedgevbset(eabc, eac).dot(e) > 0 && temp.wedgevbset(eacd, eac).dot(e) < 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [a, c, e];
            }
            if (temp.wedgevbset(eabd, ead).dot(e) > 0 && temp.wedgevbset(eacd, ead).dot(e) > 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [a, d, e];
            }
            if (temp.wedgevbset(eabc, ebc).dot(e) < 0 && temp.wedgevbset(ebcd, ebc).dot(e) < 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [b, c, e];
            }
            if (temp.wedgevbset(eabd, ebd).dot(e) < 0 && temp.wedgevbset(ebcd, ebd).dot(e) > 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [b, d, e];
            }
            if (temp.wedgevbset(eacd, ecd).dot(e) < 0 && temp.wedgevbset(ebcd, ecd).dot(e) < 0) {
                vec4Pool.push(ea, eb, ec, ed, eabc, eabd, eacd, ebcd, temp);
                bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
                return [c, d, e];
            }
            vec4Pool.push(ea, eb, ec, ed, temp);
            bivecPool.push(eab, ebc, eac, ead, ebd, ecd);
            // cell
            // turn all face normals outside
            if (reverseOrder) {
                eabd.negs(); ebcd.negs();
            } else {
                eabc.negs(); eacd.negs();
            }
            if (eabc.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return [a, b, c, e];
            }
            if (eabd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return [a, b, d, e];
            }
            if (eacd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return [a, c, d, e];
            }
            if (ebcd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return [b, c, d, e];
            }
            // otherwise origin is inside, return data for epa algorithm
            return { reverseOrder, normals: [ebcd, eacd, eabd, eabc] };
        }
        export function gjkOutDistance(convex: Convex, initSimplex?: Vec4[]): {
            simplex?: Vec4[];
            reverseOrder?: boolean;
            normals?: Vec4[];
            normal?: Vec4;
            distance?: number;
        } {
            if (!initSimplex) {
                initSimplex = [convex[0]];
            }
            // datas for states
            let steps = 0;
            let s = initSimplex;
            let reverseOrder5: boolean; // only used when s.length == 5 (store 5-simplex orientation)
            // temp vars:
            let p: Vec4;
            let pn: Vec4 | Vec4[] | { normals: Vec4[], reverseOrder: boolean };
            // let steps = [];
            while (steps++ < maxGjkStep) {
                // steps.push(s.length);
                switch (s.length) {
                    case 1:
                        // steps.push(s[0].norm());//dbg
                        p = supportNeg(convex, s[0]);
                        if (p === s[0]) {
                            return {
                                simplex: s,
                                normal: vec4Pool.pop().copy(s[0]).negs(),
                                distance: s[0].norm()
                            };
                        }
                        s.push(p); //keep s[0] older
                        break;
                    case 2:
                        pn = getClosestPointOrNormal2(s[0], s[1]);
                        // ignore far point and go on with single point
                        if (pn === s[1]) { s[0] = s[1]; s.pop(); continue; }
                        // degenerated case: exact contact simplex
                        if (pn.norm1() === 0) { return {}; }
                        // steps.push(-pn.clone().norms().dot(s[0]));//dbg
                        p = support(convex, pn);
                        // simplex can't move on, terminate
                        if (p === s[0] || p === s[1]) { return { simplex: s, normal: pn.norms(), distance: -s[0].dot(pn) }; }
                        pn.pushPool();
                        s.push(p);
                        break;
                    case 3:
                        pn = getClosestPointOrNormal3(s[0], s[1], s[2]);
                        if ((pn as Vec4[]).length) {
                            // ignore far points and go on with fewer points
                            s = pn as Vec4[]; continue;
                        }
                        // degenerated case: exact contact simplex
                        if ((pn as Vec4).norm1() === 0) { return {}; }

                        // steps.push(-(pn as Vec4).clone().norms().dot(s[0]));//dbg
                        p = support(convex, pn as Vec4);
                        // simplex can't move on, terminate
                        if (p === s[0] || p === s[1] || p === s[2]) {
                            return { simplex: s, normal: (pn as Vec4).norms(), distance: -s[0].dot((pn as Vec4)) };
                        }
                        (pn as Vec4).pushPool();
                        s.push(p);
                        break;
                    case 4:
                        pn = getClosestPointOrNormal4(s[0], s[1], s[2], s[3]);
                        if ((pn as Vec4[]).length) {
                            // ignore far points and go on with fewer points
                            s = pn as Vec4[]; continue;
                        }
                        let normal = pn as Vec4;
                        let dotFactor = -normal.dot(s[0]);
                        reverseOrder5 = dotFactor > 0; // if true, normal obtained by da^db^dc towards origin
                        normal.mulfs(dotFactor); // use mul to detect nomal or dotFactor is zero
                        // degenerated case: exact contact simplex
                        if (normal.norm1() === 0) { return {} }

                        // steps.push(-(pn as Vec4).clone().norms().dot(s[0]));//dbg
                        p = support(convex, normal);
                        // simplex can't move on, terminate
                        if (p === s[0] || p === s[1] || p === s[2] || p === s[3]) { return { simplex: s, normal: normal.norms(), distance: -normal.dot(s[0]) }; }
                        normal.pushPool();
                        s.push(p);
                        break;
                    case 5:
                        // we won't go to 5th dimension, so no normal to find anymore
                        pn = getClosestPoint5(s[0], s[1], s[2], s[3], s[4], reverseOrder5!);
                        if ((pn as Vec4[]).length) {
                            // ignore far points and go on with fewer points
                            s = pn as Vec4[]; continue;
                        } else {
                            // interior of simplex, stop
                            let info = pn as {
                                reverseOrder: boolean;
                                normals: Vec4[];
                            };
                            let out = { simplex: s, reverseOrder: info.reverseOrder, normals: info.normals };
                            return out;
                        }

                    default: console.assert(false, "simplex points error");
                }
            }
            console.warn("Physics engin's GJK algorithm has been interupped by too many steps."); return {};
        }
        /** test convex1 - convex2 to origin */
        export function gjkDiffTest(convex1: Convex, convex2: Convex, initSimplex1?: Vec4[], initSimplex2?: Vec4[]): {
            simplex1?: Vec4[];
            simplex2?: Vec4[];
            normals?: Vec4[];
            reverseOrder?: boolean;
        } {
            if (!initSimplex1) {
                initSimplex1 = [convex1[0]];
            }
            if (!initSimplex2) {
                initSimplex2 = [convex2[0]];
            }
            // datas for states
            let s1 = initSimplex1;
            let s2 = initSimplex2;
            let reverseOrder5: boolean;
            // temp vars:
            let p1: Vec4;
            let p2: Vec4;
            let normal: Vec4;
            let _vec4 = vec4Pool.pop();
            // while (true) {
            // switch (s1.length) {
            // case 1:
            [p1, p2] = supportDiffTest(convex1, convex2, _vec4.subset(s2[0], s1[0]));
            if (!p1 || (p1 === s1[0] && p2 === s2[0])) {
                return {};
            }
            s1.push(p1); s2.push(p2);
            //     break;
            // case 2:
            normal = getDiffNormal2(s1[0], s1[1], s2[0], s2[1]);
            if (normal.norm1() === 0) { return {}; }
            [p1, p2] = supportDiffTest(convex1, convex2, normal);
            // simplex can't move on, terminate
            if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1])) { return {}; }
            normal.pushPool();
            s1.push(p1); s2.push(p2);
            //     break;
            // case 3:
            normal = getDiffNormal3(s1[0], s1[1], s1[2], s2[0], s2[1], s2[2]);
            if (normal.norm1() === 0) { return {}; }
            [p1, p2] = supportDiffTest(convex1, convex2, normal);
            // simplex can't move on, terminate
            if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2])) {
                return {};
            }
            normal.pushPool();
            s1.push(p1); s2.push(p2);
            //     break;
            // case 4:
            normal = getDiffNormal4(s1[0], s1[1], s1[2], s1[3], s2[0], s2[1], s2[2], s2[3]);
            let originDir = vec4Pool.pop().subset(s1[0], s2[0]);
            let dotFactor = -normal.dot(originDir); originDir.pushPool();
            normal.mulfs(dotFactor); // use mul to detect nomal or dotFactor is zero
            if (normal.norm1() === 0) { return {}; }
            reverseOrder5 = dotFactor > 0;
            [p1, p2] = supportDiffTest(convex1, convex2, normal);
            // simplex can't move on, terminate
            if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2]) || (p1 === s1[3] && p2 === s2[3])) {
                return {};
            }
            normal.pushPool();
            s1.push(p1); s2.push(p2);
            while (true) {
                let res = getDiffNormal5(
                    s1[0], s1[1], s1[2], s1[3], s1[4],
                    s2[0], s2[1], s2[2], s2[3], s2[4], reverseOrder5
                );
                if (!res.normal) {
                    // interior, pass data to epadiff
                    return { simplex1: s1, simplex2: s2, normals: res.normals, reverseOrder: res.reverseOrder };
                }
                reverseOrder5 = res.reverseOrder;
                [p1, p2] = supportDiffTest(convex1, convex2, res.normal);
                // simplex can't move on, terminate
                if (!p1 || (p1 === s1[0] && p2 === s2[0]) || (p1 === s1[1] && p2 === s2[1]) || (p1 === s1[2] && p2 === s2[2]) || (p1 === s1[3] && p2 === s2[3]) || (p1 === s1[4] && p2 === s2[4])) {
                    return {};
                }
                s1 = res.simplex1; s1.push(p1);
                s2 = res.simplex2; s2.push(p2);
            }
        }
        function getDiffNormal2(a1: Vec4, b1: Vec4, a2: Vec4, b2: Vec4) {
            let a = vec4Pool.pop().subset(a1, a2);
            let b = vec4Pool.pop().subset(b1, b2);
            let adb = a.dot(b);
            let la = b.normsqr() - adb;
            let lb = a.normsqr() - adb;
            let out = vec4Pool.pop().set().addmulfs(a, -la).addmulfs(b, -lb);
            vec4Pool.push(a, b);
            return out;
        }
        function getDiffNormal3(
            a1: Vec4, b1: Vec4, c1: Vec4,
            a2: Vec4, b2: Vec4, c2: Vec4
        ) {
            let a = vec4Pool.pop().subset(a1, a2);
            let b = vec4Pool.pop().subset(b1, b2);
            let c = vec4Pool.pop().subset(c1, c2);
            let ca = vec4Pool.pop().subset(a, c);
            let cb = vec4Pool.pop().subset(b, c);

            let biv = bivecPool.pop().wedgevvset(ca, cb);
            let out = ca;
            out.wedgevbset(a, biv).wedgevbset(out, biv);
            vec4Pool.push(a, b, c, cb); biv.pushPool();
            return out;
        }
        function getDiffNormal4(
            a1: Vec4, b1: Vec4, c1: Vec4, d1: Vec4,
            a2: Vec4, b2: Vec4, c2: Vec4, d2: Vec4
        ) {
            let a = vec4Pool.pop().subset(a1, a2);
            let b = vec4Pool.pop().subset(b1, b2);
            let c = vec4Pool.pop().subset(c1, c2);
            let d = vec4Pool.pop().subset(d1, d2);
            let da = vec4Pool.pop().subset(a, d);
            let db = vec4Pool.pop().subset(b, d);
            let dc = vec4Pool.pop().subset(c, d);

            let dbc = bivecPool.pop().wedgevvset(db, dc);
            let dabc = vec4Pool.pop().wedgevbset(da, dbc);
            dbc.pushPool();
            vec4Pool.push(a, b, c, d, da, db, dc);
            return dabc;
        }
        function getDiffNormal5(
            a1: Vec4, b1: Vec4, c1: Vec4, d1: Vec4, e1: Vec4,
            a2: Vec4, b2: Vec4, c2: Vec4, d2: Vec4, e2: Vec4,
            reverseOrder: boolean
        ) {
            let a = vec4Pool.pop().subset(a1, a2);
            let b = vec4Pool.pop().subset(b1, b2);
            let c = vec4Pool.pop().subset(c1, c2);
            let d = vec4Pool.pop().subset(d1, d2);
            let e = vec4Pool.pop().subset(e1, e2);
            let ea = vec4Pool.pop().subset(a, e);
            let eb = vec4Pool.pop().subset(b, e);
            let ec = vec4Pool.pop().subset(c, e);
            let ed = vec4Pool.pop().subset(d, e);

            let ebc = bivecPool.pop().wedgevvset(eb, ec);
            let ebd = bivecPool.pop().wedgevvset(eb, ed);
            let ecd = bivecPool.pop().wedgevvset(ec, ed);

            let eabc = vec4Pool.pop().wedgevbset(ea, ebc); // -
            let eabd = vec4Pool.pop().wedgevbset(ea, ebd); // +
            let eacd = vec4Pool.pop().wedgevbset(ea, ecd); // -
            let ebcd = vec4Pool.pop().wedgevbset(eb, ecd); // +
            if (reverseOrder) {
                eabd.negs(); ebcd.negs();
            } else {
                eabc.negs(); eacd.negs();
            }
            if (eabc.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return { simplex1: [a1, b1, c1, e1], simplex2: [a2, b2, c2, e2], normal: eabc, reverseOrder: reverseOrder };
            }
            if (eabd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return { simplex1: [a1, b1, d1, e1], simplex2: [a2, b2, d2, e2], normal: eabd, reverseOrder: !reverseOrder };
            }
            if (eacd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return { simplex1: [a1, c1, d1, e1], simplex2: [a2, c2, d2, e2], normal: eacd, reverseOrder: reverseOrder };
            }
            if (ebcd.dot(e) < 0) {
                vec4Pool.push(eabc, eabd, eacd, ebcd);
                return { simplex1: [b1, c1, d1, e1], simplex2: [b2, c2, d2, e2], normal: ebcd, reverseOrder: !reverseOrder };
            }
            bivecPool.push(ebc, ebd, ecd);
            vec4Pool.push(a, b, c, d, e, ea, eb, ec, ed);
            // otherwise origin is inside, return data for epa algorithm
            return { reverseOrder, normals: [ebcd, eacd, eabd, eabc] };
        }
        /** expanding polytope algorithm */
        export function epa(convex: Convex, initCondition: {
            simplex: Vec4[],
            reverseOrder: boolean,
            normals: Vec4[] // normal must towards outside (away from origin)
        }) {
            let simplex = initCondition.simplex;
            let normals = initCondition.normals;
            if (initCondition.reverseOrder) {
                let temp = simplex[0]; simplex[0] = simplex[1]; simplex[1] = temp;
                let temp2 = normals[0]; normals[0] = normals[1]; normals[1] = temp2;
            }
            if (normals.length === 4) {
                let da = vec4Pool.pop().subset(simplex[0], simplex[3]);
                let db = vec4Pool.pop().subset(simplex[1], simplex[3]);
                let dc = vec4Pool.pop().subset(simplex[2], simplex[3]);

                let dbc = bivecPool.pop().wedgevvset(db, dc);
                normals.push(vec4Pool.pop().wedgevbset(da, dbc));
                dbc.pushPool();
                vec4Pool.push(da, db, dc);
            }
            // tetrahedral cell list
            let cs = [
                [simplex[1], simplex[2], simplex[4], simplex[3]],
                [simplex[2], simplex[0], simplex[4], simplex[3]],
                [simplex[0], simplex[1], simplex[4], simplex[3]],
                [simplex[0], simplex[2], simplex[4], simplex[1]],
                [simplex[0], simplex[1], simplex[3], simplex[2]],
            ]
            // normal list
            let ns = normals;
            // distance list
            let ds:number[] = [];
            let mind = Infinity;
            let minid: number;
            for (let i = 0; i < 5; i++) {
                ns[i].norms();
                let val = ns[i].dot(cs[i][0]);
                ds.push(val);
                console.assert(val > 0, "wrong init orientation");
                if (val < mind) {
                    minid = i;
                    mind = val;
                }
            }
            let pa = vec4Pool.pop();
            let pb = vec4Pool.pop();
            let pc = vec4Pool.pop();
            let pab = bivecPool.pop();

            let steps = 0;
            while (steps++ < maxEpaStep) {
                let cell = cs[minid!];
                let p = support(convex, ns[minid!]);
                console.log(`Step: ${steps} Distance:${mind}`);
                if (p === cell[0] || p === cell[1] || p === cell[2] || p === cell[3]) {
                    // can't move on, found
                    // vec4Pool.push(pa, pb, pc, pd);
                    // bivecPool.push(pab, pac, pbc);
                    for (let n of ns) {
                        if (n !== ns[minid!]) n.pushPool();
                    }
                    vec4Pool.push(pa, pb, pc);
                    bivecPool.push(pab);
                    return { simplex: cell, distance: -mind, normal: ns[minid!] }
                }

                mind = Infinity;
                // construct new convexhull after adding point p

                let newcs: Vec4[][] = [];
                let newns: Vec4[] = [];
                let newds: number[] = [];
                // borderformat [v1,v2,v3], v1,v2,v3's order is for orientation
                // mark v1 null if duplicate need to remove, 
                let border: [Vec4|undefined, Vec4|undefined, Vec4|undefined][] = [];
                function checkBorder(a: Vec4, b: Vec4, c: Vec4) {
                    for (let i of border) {
                        // if (i[0] === a) {
                        //     if (i[1] === b) {
                        //         if (i[2] === c) {
                        //             // console.assert(false);
                        //         }
                        //     } else if (i[1] === c) {
                        //         if (i[2] === b) {
                        //             i[0] = null; return;
                        //         }
                        //     }
                        // }
                        if (
                            (i[0] === a && i[1] === c && i[2] === b) ||
                            (i[0] === b && i[1] === a && i[2] === c) ||
                            (i[0] === c && i[1] === b && i[2] === a)
                        ) {
                            i[0] = undefined; return;
                        }
                    }
                    border.push([a, b, c]);
                }
                for (let idx = 0, csl = cs.length; idx < csl; idx++) {
                    let cell = cs[idx];
                    let a = cell[0];
                    let b = cell[1];
                    let c = cell[2];
                    let d = cell[3];
                    let determinant = ns[idx].dot(pa.subset(p, a));
                    if (determinant > 0) {
                        checkBorder(d, b, c); // +
                        checkBorder(d, c, a); // -
                        checkBorder(d, a, b); // +
                        checkBorder(c, b, a); // -
                    } else {
                        newcs.push(cell);
                        newns.push(ns[idx]);
                        newds.push(ds[idx]);
                        if (ds[idx] < mind) {
                            mind = ds[idx]; minid = newns.length - 1;
                        }
                    }
                }
                for (let b of border) {
                    if (!b[0]) continue;
                    pa.subset(p, b[0]);
                    pb.subset(p, b[1]!);
                    pc.subset(p, b[2]!);
                    pab.wedgevvset(pa, pb);
                    newcs.push([p, b[0], b[1]!, b[2]!]);
                    let n = vec4Pool.pop().wedgevbset(pc, pab).negs().norms();
                    let d = n.dot(p);
                    console.assert(d >= 0, "new normal needs negs");
                    if (d < mind) {
                        mind = d; minid = newds.length;
                    }
                    newns.push(n);
                    newds.push(d);
                }
                ns = newns;
                cs = newcs;
                ds = newds;
            }
            console.warn("Physics engin's GJK-EPA algorithm has been interupped by too many steps."); return {};
        }

        /** expanding polytope algorithm for minkovsky difference */
        export function epaDiff(convex1: Convex, convex2: Convex, initCondition: {
            simplex1: Vec4[],
            simplex2: Vec4[],
            reverseOrder: boolean,
            normals: Vec4[] // normal must towards outside (away from origin)
        }) {
            let s1 = initCondition.simplex1;
            let s2 = initCondition.simplex2;
            let normals = initCondition.normals;
            if (initCondition.reverseOrder) {
                let temp = s1[0]; s1[0] = s1[1]; s1[1] = temp;
                temp = s2[0]; s2[0] = s2[1]; s2[1] = temp;
                let temp2 = normals[0]; normals[0] = normals[1]; normals[1] = temp2;
            }
            if (normals.length === 4) {
                let da = vec4Pool.pop().subset(s1[0], s1[3]).subs(s2[0]).adds(s2[3]);
                let db = vec4Pool.pop().subset(s1[1], s1[3]).subs(s2[1]).adds(s2[3]);
                let dc = vec4Pool.pop().subset(s1[2], s1[3]).subs(s2[2]).adds(s2[3]);

                let dbc = bivecPool.pop().wedgevvset(db, dc);
                normals.push(vec4Pool.pop().wedgevbset(da, dbc));
                dbc.pushPool();
                vec4Pool.push(da, db, dc);
            }
            // tetrahedral cell list
            let cs1 = [
                [s1[1], s1[2], s1[4], s1[3]],
                [s1[2], s1[0], s1[4], s1[3]],
                [s1[0], s1[1], s1[4], s1[3]],
                [s1[0], s1[2], s1[4], s1[1]],
                [s1[0], s1[1], s1[3], s1[2]],
            ]
            let cs2 = [
                [s2[1], s2[2], s2[4], s2[3]],
                [s2[2], s2[0], s2[4], s2[3]],
                [s2[0], s2[1], s2[4], s2[3]],
                [s2[0], s2[2], s2[4], s2[1]],
                [s2[0], s2[1], s2[3], s2[2]],
            ]
            // normal list
            let ns = normals;
            // distance list
            let ds:number[] = [];
            let mind = Infinity;
            let minid: number;

            let pa = vec4Pool.pop();
            let pb = vec4Pool.pop();
            let pc = vec4Pool.pop();
            let p12 = vec4Pool.pop();
            let pab = bivecPool.pop();
            for (let i = 0; i < 5; i++) {
                ns[i].norms();
                let val = ns[i].dot(pa.subset(cs1[i][0], cs2[i][0]));
                ds.push(val);
                console.assert(val > 0, "wrong init orientation");
                if (val < mind) {
                    minid = i;
                    mind = val;
                }
            }

            let steps = 0;
            while (steps++ < maxEpaStep) {
                let cell1 = cs1[minid!];
                let cell2 = cs2[minid!];
                let [p1, p2] = supportDiff(convex1, convex2, ns[minid!]);
                p12.subset(p1, p2);
                if (ns[minid!].dot(p12) <= mind ||
                    (p1 === cell1[0] && p2 === cell2[0]) ||
                    (p1 === cell1[1] && p2 === cell2[1]) ||
                    (p1 === cell1[2] && p2 === cell2[2]) ||
                    (p1 === cell1[3] && p2 === cell2[3])
                ) {
                    // can't move on, found
                    for (let n of ns) {
                        if (n !== ns[minid!]) n.pushPool();
                    }
                    vec4Pool.push(pa, pb, pc);
                    bivecPool.push(pab);

                    // console.log(`Step: ${steps}`);
                    return { simplex1: cell1, simplex2: cell2, distance: -mind, normal: ns[minid!] }
                }

                mind = Infinity;
                // construct new convexhull after adding point p

                let newcs1: Vec4[][] = [];
                let newcs2: Vec4[][] = [];
                let newns: Vec4[] = [];
                let newds: number[] = [];
                // borderformat [a1,a2,a3, b1,b2,b3], order is for orientation
                // a, b are convex A's points a - convex B's points b
                // mark a1 null if duplicate need to remove, 
                let border: [Vec4|undefined, Vec4|undefined, Vec4|undefined, Vec4|undefined, Vec4|undefined, Vec4|undefined][] = [];
                function checkBorder(
                    a1: Vec4, b1: Vec4, c1: Vec4,
                    a2: Vec4, b2: Vec4, c2: Vec4
                ) {
                    for (let i of border) {
                        if (
                            (i[0] === a1 && i[3] === a2 && i[1] === c1 && i[4] === c2 && i[5] === b2 && i[2] === b1) ||
                            (i[0] === b1 && i[3] === b2 && i[1] === a1 && i[4] === a2 && i[5] === c2 && i[2] === c1) ||
                            (i[0] === c1 && i[3] === c2 && i[1] === b1 && i[4] === b2 && i[5] === a2 && i[2] === a1)
                        ) {
                            i[0] = undefined; return;
                        }
                    }
                    border.push([a1, b1, c1, a2, b2, c2]);
                }
                for (let idx = 0, csl = cs1.length; idx < csl; idx++) {
                    let cell1 = cs1[idx];
                    let cell2 = cs2[idx];
                    let a1 = cell1[0]; let a2 = cell2[0];
                    let b1 = cell1[1]; let b2 = cell2[1];
                    let c1 = cell1[2]; let c2 = cell2[2];
                    let d1 = cell1[3]; let d2 = cell2[3];
                    let determinant = ns[idx].dot(pa.subset(p12, a1).adds(a2));
                    if (determinant > 0) {
                        checkBorder(d1, b1, c1, d2, b2, c2); // +
                        checkBorder(d1, c1, a1, d2, c2, a2); // -
                        checkBorder(d1, a1, b1, d2, a2, b2); // +
                        checkBorder(c1, b1, a1, c2, b2, a2); // -
                    } else {
                        newcs1.push(cell1);
                        newcs2.push(cell2);
                        newns.push(ns[idx]);
                        newds.push(ds[idx]);
                        if (ds[idx] < mind) {
                            mind = ds[idx]; minid = newns.length - 1;
                        }
                    }
                }
                for (let b of border) {
                    if (!b[0]) continue;
                    pa.subset(p12, b[0]).adds(b[3]!);
                    pb.subset(p12, b[1]!).adds(b[4]!);
                    pc.subset(p12, b[2]!).adds(b[5]!);
                    pab.wedgevvset(pa, pb);
                    newcs1.push([p1, b[0], b[1]!, b[2]!]);
                    newcs2.push([p2, b[3]!, b[4]!, b[5]!]);
                    let n = vec4Pool.pop().wedgevbset(pc, pab).negs().norms();
                    let d = n.dot(p12);
                    if (d < 0) return;
                    // console.assert(d >= 0, "new normal needs negs");
                    if (d < mind) {
                        mind = d; minid = newds.length;
                    }
                    newns.push(n);
                    newds.push(d);
                }
                ns = newns;
                cs1 = newcs1;
                cs2 = newcs2;
                ds = newds;
            }
            // console.warn("Physics engin's GJK-EPA algorithm has been interupped by too many steps."); return {};
        }
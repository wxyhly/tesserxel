namespace tesserxel {
    export namespace physics {
        export type IntersectResult = IntersectedResult | null;
        export interface IntersectedResult {
            point: math.Vec4;
            depth: number;
            /** normal is defined from a to b */
            normal: math.Vec4;
            a: Geometry;
            b: Geometry;
        }
        let _vec4 = new math.Vec4; // cache
        export function intersetGlomeGlome(a: Glome, b: Glome): IntersectResult {
            _vec4.subset(b.position, a.position);
            let d = _vec4.norm();
            let depth = a.radius + b.radius - d;
            if (depth < 0) return null;
            // todo: check whether clone can be removed
            let normal = _vec4.divfs(d).clone();
            let point = _vec4.mulfs((a.radius - b.radius + d) * 0.5).clone();
            return { point, normal, depth, a, b };
        }
        export function inverseIntersectOrder(r: IntersectResult): IntersectResult {
            if (!r) return null;
            let temp = r.a; r.a = r.b; r.b = temp;
            r.normal.negs();
            return r;
        }
        export function intersetGlomePlane(a: Glome, b: Plane): IntersectResult {
            let depth = a.radius - (a.position.dot(b.normal) - b.offset);
            if (depth < 0) return null;
            let point = a.position.addmulfs(b.normal, depth * 0.5 - a.radius).clone();
            return { point, normal: b.normal.neg(), depth, a, b };
        }
    }
}
import { rigid, Rigid } from './rigid.js';

class BroadPhase {
    checkList = [];
    ignorePair = [];
    clearCheckList() {
        this.checkList = [];
    }
    verifyCheckList() {
        this.checkList = this.checkList.filter(([a, b]) => -1 === this.ignorePair.findIndex(([x, y]) => (a === x && b === y) || (a === y && b === x)));
    }
}
class BoundingGlomeBroadPhase extends BroadPhase {
    checkBoundingGlome(ri, rj) {
        let gi = ri.geometry instanceof rigid.Glome;
        let gj = rj.geometry instanceof rigid.Glome;
        let pi = ri.geometry instanceof rigid.Plane;
        let pj = rj.geometry instanceof rigid.Plane;
        let directDetect = (gi || pi) && (gj || pj);
        let radi = ri.geometry.boundingGlome;
        let radj = rj.geometry.boundingGlome;
        if (!directDetect && radi && radj) {
            let r = radi + radj;
            if (ri.position.distanceSqrTo(rj.position) > r * r) {
                return false;
            }
        }
        else if (pi && radj) {
            let d = radj - (rj.position.dot(ri.geometry.normal) - ri.geometry.offset);
            if (d < 0)
                return false;
        }
        else if (pj && radi) {
            let d = radi - (ri.position.dot(rj.geometry.normal) - rj.geometry.offset);
            if (d < 0)
                return false;
        }
        return true;
    }
    run(world) {
        this.clearCheckList();
        for (let i = 0; i < world.rigids.length; i++) {
            for (let j = i + 1; j < world.rigids.length; j++) {
                let ri = world.rigids[i], rj = world.rigids[j];
                if (!ri.mass && !rj.mass)
                    continue;
                if (!this.checkBoundingGlome(ri, rj))
                    continue;
                let iU = ri.geometry instanceof rigid.Union;
                let jU = rj.geometry instanceof rigid.Union;
                if (!iU && !jU) {
                    this.checkList.push([ri, rj]);
                }
                else if (iU && !jU) {
                    for (let r of ri.geometry.components) {
                        if (!this.checkBoundingGlome(r, rj))
                            continue;
                        this.checkList.push([r, rj]);
                    }
                }
                else if (!iU && jU) {
                    for (let r of rj.geometry.components) {
                        if (!this.checkBoundingGlome(r, ri))
                            continue;
                        this.checkList.push([r, ri]);
                    }
                }
                else {
                    for (let r1 of ri.geometry.components) {
                        for (let r2 of rj.geometry.components) {
                            if (!this.checkBoundingGlome(r1, r2))
                                continue;
                            this.checkList.push([r1, r2]);
                        }
                    }
                }
            }
        }
    }
}
class BoundingGlomeTreeBroadPhase extends BroadPhase {
    tree;
    exclude;
    include;
    buildTree(world) {
        this.tree = undefined;
        this.exclude = [];
        this.include = [];
        let rigidIndex = -1;
        for (let i = 0; i < world.rigids.length; i++) {
            let ri = world.rigids[i];
            if (ri.geometry instanceof rigid.Plane || ri.geometry instanceof rigid.GlomicCavity) {
                this.exclude.push(ri);
            }
            else {
                this.include.push(ri);
                rigidIndex++;
                let riRadius = ri.geometry.boundingGlome;
                let newRigidNode = {
                    radius: riRadius, position: ri.position.clone(),
                    surcell: riRadius * riRadius,
                    child1: ri, rigidIndex
                };
                if (!this.tree) {
                    // create initial tree: node->rigid[0]
                    this.tree = newRigidNode;
                }
                else {
                    let node = this.tree;
                    let nodeNeedUpdate = true;
                    let done = false;
                    while (!done) {
                        if (node.child1 instanceof Rigid) {
                            // insert a new leaf node for rigid
                            let radius = node.child1.geometry.boundingGlome;
                            let surcell = nodeNeedUpdate ? node.surcell : radius * radius;
                            let wrapNode = {
                                radius, position: node.child1.position.clone(), surcell,
                                child1: node.child1, parent: node, rigidIndex: node.rigidIndex
                            };
                            node.child1 = wrapNode;
                            node.child2 = newRigidNode;
                            newRigidNode.parent = node;
                            node.rigidIndex = undefined;
                            done = true;
                        }
                        if (nodeNeedUpdate) {
                            // update node's bounding glome
                            let distance = node.position.distanceTo(newRigidNode.position);
                            let newRadius = (distance + riRadius + node.radius) * 0.5;
                            if (newRadius <= Math.min(riRadius, node.radius)) {
                                if (newRadius <= riRadius) {
                                    node.position.copy(ri.position);
                                    node.radius = riRadius;
                                    node.surcell = newRigidNode.surcell;
                                }
                            }
                            else {
                                node.position.subs(ri.position).mulfs((newRadius - riRadius) / distance).adds(ri.position);
                                node.radius = newRadius;
                                node.surcell = node.radius * node.radius;
                            }
                        }
                        if (!done && node.child2) {
                            let distance1 = ri.position.distanceTo(node.child1.position);
                            let d1 = distance1 + riRadius + node.child1.radius;
                            let surcell1 = d1 * d1 * 0.25;
                            let distance2 = ri.position.distanceTo(node.child2.position);
                            let d2 = distance2 + riRadius + node.child2.radius;
                            let surcell2 = d2 * d2 * 0.25;
                            let surcell = Math.min(surcell1, surcell2);
                            let radius, distance;
                            if (surcell1 - node.child1.surcell < surcell2 - node.child2.surcell) {
                                node = node.child1;
                                radius = d1 * 0.5;
                                distance = distance1;
                            }
                            else {
                                node = node.child2;
                                radius = d2 * 0.5;
                                distance = distance2;
                            }
                            node.position.subs(ri.position).mulfs((radius - riRadius) / distance).adds(ri.position);
                            node.radius = radius;
                            node.surcell = surcell;
                            nodeNeedUpdate = false;
                        }
                    }
                }
            }
        }
    }
    run(world) {
        this.clearCheckList();
        this.buildTree(world);
        for (let includeIdx = 0; includeIdx < this.include.length; includeIdx++) {
            const stack = [this.tree];
            const i = this.include[includeIdx];
            while (stack.length) {
                const node = stack.pop();
                if (node.child1 instanceof Rigid) {
                    if (node.rigidIndex <= includeIdx) {
                        continue;
                    }
                }
                let r = i.geometry.boundingGlome + node.radius;
                if (i.position.distanceSqrTo(node.position) < r * r) {
                    if (node.child2) {
                        stack.push(node.child1, node.child2);
                    }
                    else {
                        this.checkList.push([i, node.child1]);
                    }
                }
            }
            for (let e of this.exclude) {
                this.checkList.push([i, e]);
            }
        }
    }
}
class NaiveBroadPhase extends BroadPhase {
    run(world) {
        this.clearCheckList();
        for (let i = 0; i < world.rigids.length; i++) {
            for (let j = i + 1; j < world.rigids.length; j++) {
                let ri = world.rigids[i], rj = world.rigids[j];
                if (!ri.mass && !rj.mass)
                    continue;
                let iU = ri.geometry instanceof rigid.Union;
                let jU = rj.geometry instanceof rigid.Union;
                if (!iU && !jU) {
                    this.checkList.push([ri, rj]);
                }
                else if (iU && !jU) {
                    for (let r of ri.geometry.components) {
                        this.checkList.push([r, rj]);
                    }
                }
                else if (!iU && jU) {
                    for (let r of rj.geometry.components) {
                        this.checkList.push([r, ri]);
                    }
                }
                else {
                    for (let r1 of ri.geometry.components) {
                        for (let r2 of rj.geometry.components) {
                            this.checkList.push([r1, r2]);
                        }
                    }
                }
            }
        }
        this.verifyCheckList();
    }
}
class IgnoreAllBroadPhase extends BroadPhase {
    run(world) {
        this.clearCheckList();
    }
}

export { BoundingGlomeBroadPhase, BoundingGlomeTreeBroadPhase, BroadPhase, IgnoreAllBroadPhase, NaiveBroadPhase };
//# sourceMappingURL=broadPhase.js.map

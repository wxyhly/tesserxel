import { math } from "../../build/tesserxel.js";
const lang = new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en");
function genRandS5point() {
    const a1 = Math.random() * 2 - 1;
    const a2 = Math.random() * 2 - 1;
    const a3 = Math.random() * 2 - 1;
    const a4 = Math.random() * 2 - 1;
    const a5 = Math.random() * 2 - 1;
    const a6 = Math.random() * 2 - 1;
    if (a1 * a1 + a2 * a2 + a3 * a3 + a4 * a4 + a5 * a5 + a6 * a6 > 1)
        return genRandS5point();
    return getDegree(new math.Bivec(a1, a2, a3, a4, a5, a6).norms());
}
function genRandRotLog() {
    return getDegree(math.Rotor.rand().log().norms());
}
function genSimpleRandWalk() {
    const step = 100;
    const b1 = new math.Bivec();
    const b2 = new math.Bivec();
    for (let i = 0; i < step; i++) {
        b2.randset();
        b1.adds(b2);
    }
    return getDegree(b1.norms());
}
function getDegree(biv) {
    let degree = Math.atan2(biv.dual().adds(biv).norm(), biv.dual().subs(biv).norm());
    degree = degree * 4 / Math.PI - 1;
    return degree;
}
export var rotmath;
(function (rotmath) {
    async function load() {
        const pointsPerTick = 1000;
        const delta = 0.01;
        const canvas = document.getElementById("gpu-canvas");
        const c = canvas.getContext("2d");
        const container1 = new Int32Array(Math.ceil(2 / delta));
        const container2 = new Int32Array(Math.ceil(2 / delta));
        const container3 = new Int32Array(Math.ceil(2 / delta));
        function updateContainer(container, fn) {
            for (let i = 0; i < pointsPerTick; i++) {
                container[Math.floor((fn() + 1) / delta)]++;
            }
        }
        function setSize() {
            let width = window.innerWidth * window.devicePixelRatio;
            let height = window.innerHeight * window.devicePixelRatio;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener("resize", setSize);
        setSize();
        let totalPoints = 0;
        function run() {
            updateContainer(container1, genSimpleRandWalk);
            updateContainer(container2, genRandRotLog);
            updateContainer(container3, genRandS5point);
            c.clearRect(0, 0, canvas.width, canvas.height);
            const wdiv2 = canvas.width / 2;
            const h = canvas.height - 10;
            const dw = wdiv2 * delta * 0.3;
            totalPoints += pointsPerTick;
            const scale = 0.6 * h / totalPoints / delta;
            c.fillStyle = "rgba(255,0,0,0.5)";
            for (let d = -1, idx = 0; d < 1; d += delta, idx++) {
                const left = wdiv2 * (1 + d);
                const value = container1[idx] * scale;
                c.fillRect(left, h, dw, -value);
            }
            c.fillStyle = "rgba(0,255,0,0.5)";
            for (let d = -1, idx = 0; d < 1; d += delta, idx++) {
                const left = wdiv2 * (1 + d);
                const value = container2[idx] * scale;
                c.fillRect(left + dw, h, dw, -value);
            }
            c.fillStyle = "rgba(0,0,255,0.5)";
            for (let d = -1, idx = 0; d < 1; d += delta, idx++) {
                const left = wdiv2 * (1 + d);
                const value = container3[idx] * scale;
                c.fillRect(left + dw + dw, h, dw, -value);
            }
            window.requestAnimationFrame(run);
        }
        run();
    }
    rotmath.load = load;
})(rotmath || (rotmath = {}));
//# sourceMappingURL=rotmath.js.map
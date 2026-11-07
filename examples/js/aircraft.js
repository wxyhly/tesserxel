import * as tesserxel from "../../build/esm/tesserxel.js";
const FOUR = tesserxel.four;
const PHY = tesserxel.physics;
const Vec4 = tesserxel.math.Vec4;
const Obj4 = tesserxel.math.Obj4;
const Bivec = tesserxel.math.Bivec;
const geomTesseract = new FOUR.TesseractGeometry(1);
const lang = (new URLSearchParams(window.location.search.slice(1)).get("lang") ?? (navigator.languages.join(",").includes("zh") ? "zh" : "en"));
const HUD_COLORS = {
    text: "#f4f2ed",
    grid: "#76c96bee",
    gridFaint: "#76c96bee",
    accent: "#eaef43",
    marker: "#eaff43",
    track: "#76c96bee",
    thumbOutline: "#10200f"
};
const HUD_STROKE_WIDTHS = {
    thin: 1,
    thick: 3,
    tripletTrack: 1.5,
    tripletDifference: 1.5
};
const HUD_LAYOUT = {
    root: { top: 50, left: 0 },
    viewBox: { width: 300, height: 440 },
    controls: {
        bar: { y: 34, length: 80, markerHalfHeight: 5, endTickHalfHeight: 3 },
        throttle: { x: 10 },
        flap: { x: 110 },
        text: { titleOffset: { x: 0, y: -9 }, valueOffset: { x: 60, y: -9 }, titleSize: 9, valueSize: 7 }
    },
    triplet: {
        firstCenter: { x: 60, y: 86 },
        gapX: 100,
        instances: [
            { key: "aileron", trackStart: -22, commonZeroOffsetY: 0, commonTravel: 20, centered: true },
            { key: "brake", trackStart: 0, commonZeroOffsetY: 20, commonTravel: 40, centered: false }
        ],
        radius: 22,
        pointRadius: 3.5,
        differenceRadius: 4,
        centerDotRadius: 1.5,
        labelRadius: 25,
        labelOffsetY: 2,
        commonBarOffsetX: -40,
        commonAxisHalfLength: 20,
        commonZeroHalfLength: 4,
        commonRange: 1,
        differenceScaleFactor: 22,
        transitionMs: 200,
        directions: [0, 2 * Math.PI / 3, 4 * Math.PI / 3],
        text: { titleOffsetY: -38, readoutOffsetY: -26, commonOffsetX: -50, differenceOffsetX: 0, titleSize: 9, readoutSize: 7 }
    },
    verticalBar: {
        firstCenter: { x: 20, y: 150 },
        gapX: 50,
        halfLength: 30,
        centerHalfWidth: 4,
        tickHalfWidth: 3,
        labelOffset: { x: 2, y: 2 },
        tickSpacing: 10,
        text: { titleGap: 5, valueGap: 8, titleSize: 7, valueSize: 7 },
        instruments: [
            { key: "height", step: 10 },
            { key: "pitch", step: 15 },
            { key: "speedVertical", step: 5 },
            { key: "angular0", step: 0.2 }
        ]
    },
    horizontalBar: {
        firstCenter: { x: 50, y: 210 },
        gapX: 100,
        halfLength: 40,
        halfHeight: 4,
        labelOffsetY: 10,
        tickSpacing: 20,
        text: { yOffset: -12, titleSize: 8, valueSize: 7 },
        instruments: [
            { key: "speedForward", step: 5, titleOffsetX: -30, valueOffsetX: 12 },
            { key: "angular5", step: 0.5, titleOffsetX: -30, valueOffsetX: 12 }
        ]
    },
    vector: {
        firstCenter: { x: 50, y: 276 },
        columns: 2,
        gapX: 100,
        gapY: 85,
        radius: 25,
        innerRings: [17, 8],
        axisHalfLength: 29,
        tickLabelOffset: { x: 1, y: 1.5 },
        upperTickLabelOffsetY: -1,
        lowerTickLabelOffsetY: 4,
        text: { titleOffsetY: -36, valueOffsetY: 37, titleSize: 7, valueSize: 7 },
        instruments: [
            { key: "attitude", scale: 15, ticks: [5, 10, 15] },
            { key: "roll", scale: 0.3, ticks: [0.1, 0.2, 0.3] },
            { key: "sideSpeed", scale: 12, ticks: [4, 8, 12] },
            { key: "yaw", scale: 0.3, ticks: [0.1, 0.2, 0.3] }
        ]
    },
    cameraText: {
        origin: { x: 10, y: 18 },
        fovOffsetY: 18,
        hintOffsetY: 35,
        presetHintOffsetY: 47,
        titleSize: 9,
        fovSize: 11,
        hintSize: 8
    }
};
class AircraftHud {
    root;
    values = new Map();
    sliders = new Map();
    differences = new Map();
    bars = new Map();
    vectors = new Map();
    commonMarkers = new Map();
    aircraftGroup;
    cameraGroup;
    cameraModeHint;
    cameraPresetHint;
    aileronDifferenceScale = 0.01;
    displayedAilerons = null;
    lastAileronUpdate = 0;
    tripletLayout(name) {
        const index = HUD_LAYOUT.triplet.instances.findIndex(instance => instance.key === name);
        if (index < 0)
            throw new Error(`Missing aircraft HUD triplet layout: ${name}`);
        const instance = HUD_LAYOUT.triplet.instances[index];
        return {
            ...instance,
            center: {
                x: HUD_LAYOUT.triplet.firstCenter.x + index * HUD_LAYOUT.triplet.gapX,
                y: HUD_LAYOUT.triplet.firstCenter.y
            }
        };
    }
    createTextDrawings() {
        const text = (x, y, content, attributes = "") => `<text x="${x}" y="${y}" ${attributes}>${content}</text>`;
        const value = (x, y, key, size, anchor = "middle", dataAttribute = "data-value") => text(x, y, "", `text-anchor="${anchor}" font-size="${size}" ${dataAttribute}="${key}"`);
        const readout = (x, y, label, key, size) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="start">${label} <tspan data-value="${key}"></tspan></text>`;
        const labels = {
            camera: lang === "zh" ? "相机视野角" : "CAMERA FOV",
            throttle: lang === "zh" ? "引擎功率" : "THROTTLE",
            flap: lang === "zh" ? "襟翼" : "FLAPS",
            aileron: lang === "zh" ? "副翼" : "AILERONS",
            brake: lang === "zh" ? "起落架刹车" : "GEAR BRAKES",
            common: lang === "zh" ? "共模" : "COMMN",
            difference: lang === "zh" ? "差模" : "DIFF",
            height: lang === "zh" ? "高度" : "ALT",
            pitch: lang === "zh" ? "俯仰角" : "PITCH",
            speedVertical: lang === "zh" ? "高度速度" : "ALT SPEED",
            angular0: lang === "zh" ? "俯仰角速度" : "PITCH RATE",
            speedForward: lang === "zh" ? "前进速度" : "AHEAD VELOCITY",
            angular5: lang === "zh" ? "自转角速度" : "SPIN RATE",
            attitude: lang === "zh" ? "横滚姿态" : "ROLL ATTITUDE",
            roll: lang === "zh" ? "横滚角速度" : "ROLL RATE",
            sideSpeed: lang === "zh" ? "侧向速度" : "LATERAL SPEED",
            yaw: lang === "zh" ? "偏航角速度" : "YAW RATE"
        };
        const camera = HUD_LAYOUT.cameraText;
        const cameraText = `<g data-camera>${text(camera.origin.x, camera.origin.y, labels.camera, `font-size="${camera.titleSize}"`)}${value(camera.origin.x, camera.origin.y + camera.fovOffsetY, "fov", camera.fovSize, "start")}${text(camera.origin.x, camera.origin.y + camera.hintOffsetY, "", `font-size="${camera.hintSize}" data-camera-mode-hint`)}${text(camera.origin.x, camera.origin.y + camera.presetHintOffsetY, "", `font-size="${camera.hintSize}" data-camera-preset-hint`)}</g>`;
        const controls = ["throttle", "flap"].map(key => {
            const origin = HUD_LAYOUT.controls[key];
            const layout = HUD_LAYOUT.controls.text;
            return text(origin.x + layout.titleOffset.x, HUD_LAYOUT.controls.bar.y + layout.titleOffset.y, labels[key], `font-size="${layout.titleSize}"`)
                + value(origin.x + layout.valueOffset.x, HUD_LAYOUT.controls.bar.y + layout.valueOffset.y, key, layout.valueSize, "start");
        }).join("");
        const triplets = HUD_LAYOUT.triplet.instances.map((instance, index) => {
            const centerX = HUD_LAYOUT.triplet.firstCenter.x + index * HUD_LAYOUT.triplet.gapX;
            const centerY = HUD_LAYOUT.triplet.firstCenter.y;
            const layout = HUD_LAYOUT.triplet.text;
            const title = text(centerX, centerY + layout.titleOffsetY, labels[instance.key], `font-size="${layout.titleSize}" font-weight="700" text-anchor="middle"`);
            const commonX = centerX + layout.commonOffsetX;
            const readoutY = centerY + layout.readoutOffsetY;
            const common = readout(commonX, readoutY, labels.common, `${instance.key}Common`, layout.readoutSize);
            const differenceX = centerX + layout.differenceOffsetX;
            const difference = readout(differenceX, readoutY, labels.difference, `${instance.key}Difference`, layout.readoutSize);
            return title + common + difference;
        }).join("");
        const verticalBars = HUD_LAYOUT.verticalBar.instruments.map((instrument, index) => {
            const x = HUD_LAYOUT.verticalBar.firstCenter.x + index * HUD_LAYOUT.verticalBar.gapX;
            const y = HUD_LAYOUT.verticalBar.firstCenter.y;
            const layout = HUD_LAYOUT.verticalBar.text;
            return text(x, y - HUD_LAYOUT.verticalBar.halfLength - layout.titleGap, labels[instrument.key], `font-size="${layout.titleSize}" text-anchor="middle"`)
                + value(x, y + HUD_LAYOUT.verticalBar.halfLength + layout.valueGap, instrument.key, layout.valueSize);
        }).join("");
        const horizontalBars = HUD_LAYOUT.horizontalBar.instruments.map((instrument, index) => {
            const x = HUD_LAYOUT.horizontalBar.firstCenter.x + index * HUD_LAYOUT.horizontalBar.gapX;
            const y = HUD_LAYOUT.horizontalBar.firstCenter.y;
            const layout = HUD_LAYOUT.horizontalBar.text;
            return text(x + instrument.titleOffsetX, y + layout.yOffset, labels[instrument.key], `font-size="${layout.titleSize}"`)
                + text(x + instrument.valueOffsetX, y + layout.yOffset, "", `font-size="${layout.valueSize}" text-anchor="start" data-value="${instrument.key}"`);
        }).join("");
        const vectors = HUD_LAYOUT.vector.instruments.map((instrument, index) => {
            const column = index % HUD_LAYOUT.vector.columns;
            const row = Math.floor(index / HUD_LAYOUT.vector.columns);
            const x = HUD_LAYOUT.vector.firstCenter.x + column * HUD_LAYOUT.vector.gapX;
            const y = HUD_LAYOUT.vector.firstCenter.y + row * HUD_LAYOUT.vector.gapY;
            const layout = HUD_LAYOUT.vector.text;
            return text(x, y + layout.titleOffsetY, labels[instrument.key], `font-size="${layout.titleSize}" text-anchor="middle"`)
                + value(x, y + layout.valueOffsetY, instrument.key, layout.valueSize, "middle", "data-vector-value");
        }).join("");
        return `${cameraText}<g data-aircraft>${controls}${triplets}${verticalBars}${horizontalBars}${vectors}${this.createDrawings()}</g>`;
    }
    createDrawings() {
        const controls = ["throttle", "flap"].map(name => {
            const origin = HUD_LAYOUT.controls[name];
            const { y, length, markerHalfHeight, endTickHalfHeight } = HUD_LAYOUT.controls.bar;
            const end = origin.x + length;
            return `<line x1="${origin.x}" y1="${y}" x2="${end}" y2="${y}"/><line x1="${origin.x}" y1="${y - endTickHalfHeight}" x2="${origin.x}" y2="${y + endTickHalfHeight}" stroke="var(--hud-accent)" stroke-width="var(--hud-stroke-thin)"/><line x1="${end}" y1="${y - endTickHalfHeight}" x2="${end}" y2="${y + endTickHalfHeight}" stroke="var(--hud-accent)" stroke-width="var(--hud-stroke-thin)"/><line x1="${origin.x}" y1="${y - markerHalfHeight}" x2="${origin.x}" y2="${y + markerHalfHeight}" stroke="var(--hud-text)" stroke-width="var(--hud-stroke-thick)" data-marker="${name}"/>`;
        }).join("");
        const triplets = HUD_LAYOUT.triplet.instances.map((instance, index) => {
            const x = HUD_LAYOUT.triplet.firstCenter.x + index * HUD_LAYOUT.triplet.gapX;
            const y = HUD_LAYOUT.triplet.firstCenter.y;
            const commonX = x + HUD_LAYOUT.triplet.commonBarOffsetX;
            const commonZeroY = y + instance.commonZeroOffsetY;
            const centerMarker = instance.centered
                ? `<circle cx="${x}" cy="${y}" r="${HUD_LAYOUT.triplet.centerDotRadius}" fill="var(--hud-accent)" stroke="none"/>`
                : "";
            return `<g data-common-tape="${instance.key}"><line x1="${commonX}" y1="${y - HUD_LAYOUT.triplet.commonAxisHalfLength}" x2="${commonX}" y2="${y + HUD_LAYOUT.triplet.commonAxisHalfLength}"/><line x1="${commonX - HUD_LAYOUT.triplet.commonZeroHalfLength}" y1="${commonZeroY}" x2="${commonX + HUD_LAYOUT.triplet.commonZeroHalfLength}" y2="${commonZeroY}" stroke="var(--hud-grid)"/><line x1="${commonX - HUD_LAYOUT.triplet.commonZeroHalfLength}" y1="${commonZeroY}" x2="${commonX + HUD_LAYOUT.triplet.commonZeroHalfLength}" y2="${commonZeroY}" stroke="var(--hud-accent)" stroke-width="var(--hud-stroke-thick)" data-common-marker="${instance.key}"/></g><g data-triplet="${instance.key}"><g data-tracks/><g data-points/>${centerMarker}<circle cx="${x}" cy="${y}" r="${HUD_LAYOUT.triplet.differenceRadius}" fill="none" stroke="var(--hud-accent)" stroke-width="var(--hud-stroke-triplet-difference)" data-difference/></g>`;
        }).join("");
        const verticalBars = HUD_LAYOUT.verticalBar.instruments.map((instrument, index) => {
            const x = HUD_LAYOUT.verticalBar.firstCenter.x + index * HUD_LAYOUT.verticalBar.gapX;
            const y = HUD_LAYOUT.verticalBar.firstCenter.y;
            const halfLength = HUD_LAYOUT.verticalBar.halfLength;
            const halfWidth = HUD_LAYOUT.verticalBar.centerHalfWidth;
            return `<line x1="${x}" y1="${y - halfLength}" x2="${x}" y2="${y + halfLength}"/><line x1="${x - halfWidth}" y1="${y}" x2="${x + halfWidth}" y2="${y}" stroke="var(--hud-marker)" stroke-width="var(--hud-stroke-thick)"/><g data-tape="${instrument.key}"/>`;
        }).join("");
        const horizontalBars = HUD_LAYOUT.horizontalBar.instruments.map((instrument, index) => {
            const center = {
                x: HUD_LAYOUT.horizontalBar.firstCenter.x + index * HUD_LAYOUT.horizontalBar.gapX,
                y: HUD_LAYOUT.horizontalBar.firstCenter.y
            };
            const halfLength = HUD_LAYOUT.horizontalBar.halfLength;
            const halfHeight = HUD_LAYOUT.horizontalBar.halfHeight;
            return `<line x1="${center.x - halfLength}" y1="${center.y}" x2="${center.x + halfLength}" y2="${center.y}"/><g data-tape="${instrument.key}"/><line x1="${center.x}" y1="${center.y - halfHeight}" x2="${center.x}" y2="${center.y + halfHeight}" stroke="var(--hud-marker)" stroke-width="var(--hud-stroke-thick)"/>`;
        }).join("");
        const vectorCharts = HUD_LAYOUT.vector.instruments.map((instrument, index) => {
            const column = index % HUD_LAYOUT.vector.columns;
            const row = Math.floor(index / HUD_LAYOUT.vector.columns);
            const x = HUD_LAYOUT.vector.firstCenter.x + column * HUD_LAYOUT.vector.gapX;
            const y = HUD_LAYOUT.vector.firstCenter.y + row * HUD_LAYOUT.vector.gapY;
            const rings = `<circle cx="${x}" cy="${y}" r="${HUD_LAYOUT.vector.radius}" data-vector-origin="${instrument.key}"/>`
                + HUD_LAYOUT.vector.innerRings.map(radius => `<circle cx="${x}" cy="${y}" r="${radius}"/>`).join("");
            const half = HUD_LAYOUT.vector.axisHalfLength;
            const axes = `<path d="M${x - half} ${y}h${half * 2}M${x} ${y - half}v${half * 2}"/>`;
            const needle = `<line x1="${x}" y1="${y}" x2="${x}" y2="${y}" data-vector-needle="${instrument.key}"/>`;
            return { rings: rings + axes, needle };
        });
        return `<g fill="none" stroke="var(--hud-grid)" stroke-width="var(--hud-stroke-thin)">${controls}${triplets}${verticalBars}${horizontalBars}</g><g fill="none" stroke="var(--hud-grid-faint)" stroke-width="var(--hud-stroke-thin)">${vectorCharts.map(chart => chart.rings).join("")}</g><g fill="none" stroke="var(--hud-accent)" stroke-width="var(--hud-stroke-thick)">${vectorCharts.map(chart => chart.needle).join("")}</g>`;
    }
    formatValue(value, digits) {
        return Math.abs(value) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : value.toFixed(digits);
    }
    formatKey(code) {
        const keyLabels = {
            ControlLeft: "Ctrl",
            ControlRight: "Ctrl",
            ShiftLeft: "Shift",
            ShiftRight: "Shift",
            AltLeft: "Alt",
            AltRight: "Alt",
            MetaLeft: "Meta",
            MetaRight: "Meta",
            ArrowUp: "↑",
            ArrowDown: "↓",
            ArrowLeft: "←",
            ArrowRight: "→"
        };
        if (!code)
            return lang === "zh" ? "未设置" : "Unbound";
        return code.split("|").map(combo => combo.split("+").map(part => {
            const key = part.replace(/^\./, "");
            if (keyLabels[key])
                return keyLabels[key];
            if (key.startsWith("Key"))
                return key.slice(3);
            if (key.startsWith("Digit"))
                return key.slice(5);
            if (key.startsWith("Numpad"))
                return `Num${key.slice(6)}`;
            return key;
        }).join("+")).join("/");
    }
    constructor(root) {
        this.root = root;
        root.style.cssText = `position:fixed;top:${HUD_LAYOUT.root.top}px;left:${HUD_LAYOUT.root.left}px;z-index:10;pointer-events:none;`;
        root.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HUD_LAYOUT.viewBox.width} ${HUD_LAYOUT.viewBox.height}" width="100%" aria-label="Aircraft instruments" style="display:block;overflow:visible;background:transparent;--hud-text:${HUD_COLORS.text};--hud-grid:${HUD_COLORS.grid};--hud-grid-faint:${HUD_COLORS.gridFaint};--hud-accent:${HUD_COLORS.accent};--hud-marker:${HUD_COLORS.marker};--hud-track:${HUD_COLORS.track};--hud-thumb-outline:${HUD_COLORS.thumbOutline};--hud-stroke-thin:${HUD_STROKE_WIDTHS.thin};--hud-stroke-thick:${HUD_STROKE_WIDTHS.thick};--hud-stroke-triplet-track:${HUD_STROKE_WIDTHS.tripletTrack};--hud-stroke-triplet-difference:${HUD_STROKE_WIDTHS.tripletDifference}" font-family="system-ui,sans-serif" fill="var(--hud-text)">
${this.createTextDrawings()}
</svg>`;
        this.aircraftGroup = root.querySelector("[data-aircraft]");
        this.cameraGroup = root.querySelector("[data-camera]");
        this.cameraModeHint = root.querySelector("[data-camera-mode-hint]");
        this.cameraPresetHint = root.querySelector("[data-camera-preset-hint]");
        root.querySelectorAll("[data-value]").forEach(element => this.values.set(element.dataset.value, element));
        for (const instrument of [...HUD_LAYOUT.verticalBar.instruments, ...HUD_LAYOUT.horizontalBar.instruments]) {
            this.bars.set(instrument.key, root.querySelector(`[data-tape="${instrument.key}"]`));
        }
        for (const [index, instrument] of HUD_LAYOUT.vector.instruments.entries()) {
            const column = index % HUD_LAYOUT.vector.columns;
            const row = Math.floor(index / HUD_LAYOUT.vector.columns);
            this.vectors.set(instrument.key, {
                x: HUD_LAYOUT.vector.firstCenter.x + column * HUD_LAYOUT.vector.gapX,
                y: HUD_LAYOUT.vector.firstCenter.y + row * HUD_LAYOUT.vector.gapY,
                radius: HUD_LAYOUT.vector.radius,
                scale: instrument.scale,
                ticks: instrument.ticks,
                needle: root.querySelector(`[data-vector-needle="${instrument.key}"]`),
                value: root.querySelector(`[data-vector-value="${instrument.key}"]`)
            });
        }
        const tickLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
        tickLabels.setAttribute("fill", "var(--hud-text)");
        tickLabels.setAttribute("font-size", "5");
        tickLabels.setAttribute("stroke", "none");
        for (const vector of this.vectors.values()) {
            const ticks = vector.ticks;
            for (const tick of ticks) {
                const radius = tick / vector.scale * vector.radius;
                const digits = Number.isInteger(tick) ? 0 : (tick.toString().split(".")[1]?.length ?? 0);
                const label = this.formatValue(tick, digits);
                for (const direction of [-1, 1]) {
                    const layout = HUD_LAYOUT.vector;
                    const horizontalPosition = { x: direction * radius, y: layout.tickLabelOffset.y };
                    const verticalPosition = {
                        x: layout.tickLabelOffset.x,
                        y: -direction * radius + (direction > 0 ? layout.upperTickLabelOffsetY : layout.lowerTickLabelOffsetY)
                    };
                    tickLabels.insertAdjacentHTML("beforeend", `<text x="${vector.x + horizontalPosition.x}" y="${vector.y + horizontalPosition.y}" text-anchor="${direction > 0 ? "start" : "end"}">${direction * tick < 0 ? `-${label}` : label}</text><text x="${vector.x + verticalPosition.x}" y="${vector.y + verticalPosition.y}" text-anchor="start">${direction > 0 ? label : `-${label}`}</text>`);
                }
            }
        }
        const needleGroup = root.querySelector('[data-vector-needle="attitude"]').parentElement;
        this.aircraftGroup.insertBefore(tickLabels, needleGroup);
        for (const config of HUD_LAYOUT.triplet.instances) {
            const name = config.key;
            const { x: cx, y: cy } = this.tripletLayout(name).center;
            const group = root.querySelector(`[data-triplet="${name}"]`);
            const tracks = group.querySelector("[data-tracks]");
            const points = group.querySelector("[data-points]");
            this.commonMarkers.set(name, root.querySelector(`[data-common-marker="${name}"]`));
            for (const angle of HUD_LAYOUT.triplet.directions) {
                const ux = Math.cos(angle), uy = -Math.sin(angle);
                tracks.insertAdjacentHTML("beforeend", `<line x1="${cx + ux * config.trackStart}" y1="${cy + uy * config.trackStart}" x2="${cx + ux * HUD_LAYOUT.triplet.radius}" y2="${cy + uy * HUD_LAYOUT.triplet.radius}" stroke="var(--hud-track)" stroke-width="var(--hud-stroke-triplet-track)"/><circle cx="${cx}" cy="${cy}" r="${HUD_LAYOUT.triplet.pointRadius}" fill="${HUD_COLORS.marker}" stroke="${HUD_COLORS.thumbOutline}"/>`);
                points.appendChild(tracks.lastElementChild.cloneNode(true));
                tracks.lastElementChild.remove();
            }
            const commonX = cx + HUD_LAYOUT.triplet.commonBarOffsetX;
            const commonMarker = this.commonMarkers.get(name);
            const markerHalfLength = HUD_LAYOUT.triplet.commonZeroHalfLength;
            commonMarker.setAttribute("x1", `${commonX - markerHalfLength}`);
            commonMarker.setAttribute("x2", `${commonX + markerHalfLength}`);
            commonMarker.setAttribute("y1", `${cy + config.commonZeroOffsetY}`);
            commonMarker.setAttribute("y2", `${cy + config.commonZeroOffsetY}`);
            group.querySelector("[data-difference]").setAttribute("cx", `${cx}`);
            group.querySelector("[data-difference]").setAttribute("cy", `${cy}`);
            this.sliders.set(name, Array.from(points.querySelectorAll("circle")));
            this.differences.set(name, group.querySelector("[data-difference]"));
            const labels = group.querySelector("[data-labels]") ?? document.createElementNS("http://www.w3.org/2000/svg", "g");
            labels.setAttribute("fill", "var(--hud-text)");
            labels.setAttribute("font-size", "6");
            labels.setAttribute("stroke", "none");
            for (const [index, letter] of ["A", "B", "C"].entries()) {
                const angle = HUD_LAYOUT.triplet.directions[index];
                labels.insertAdjacentHTML("beforeend", `<text x="${cx + Math.cos(angle) * HUD_LAYOUT.triplet.labelRadius}" y="${cy - Math.sin(angle) * HUD_LAYOUT.triplet.labelRadius + HUD_LAYOUT.triplet.labelOffsetY}" text-anchor="middle">${letter}</text>`);
            }
            group.appendChild(labels);
        }
    }
    update(data) {
        const set = (key, value) => {
            const element = this.values.get(key);
            if (!element)
                throw new Error(`Missing aircraft HUD value element: ${key}`);
            element.textContent = value;
        };
        set("fov", `${this.formatValue(data.fov, 0)}°`);
        this.cameraModeHint.textContent = lang === "zh"
            ? `${this.formatKey(data.cameraModeKey)}：切换控制飞机/控制相机`
            : `${this.formatKey(data.cameraModeKey)}: Toggle aircraft view/control`;
        this.cameraPresetHint.textContent = lang === "zh"
            ? `相机机位 ${data.cameraPresetKeys.map(key => this.formatKey(key)).join(" ")}`
            : `Camera Pos: ${data.cameraPresetKeys.map(key => this.formatKey(key)).join(" ")}`;
        this.aircraftGroup.style.display = data.aircraftMode ? "" : "none";
        this.cameraGroup.style.display = data.aircraftMode ? "none" : "";
        set("throttle", this.formatValue(data.throttle, 2));
        set("flap", this.formatValue(data.flap, 2));
        set("height", this.formatValue(data.height, 1));
        set("speedForward", this.formatValue(data.speedForward, 1));
        set("speedVertical", this.formatValue(data.speedVertical, 1));
        const ailerons = this.transitionAilerons(data.ailerons);
        const aileronCommon = (ailerons[0] + ailerons[1] + ailerons[2]) / 3;
        const brakeCommon = (data.brakes[0] + data.brakes[1] + data.brakes[2]) / 3;
        set("aileronCommon", this.formatValue(aileronCommon, 1));
        set("aileronDifference", this.formatValue(this.tripletMagnitude(ailerons), 3));
        set("brakeCommon", this.formatValue(brakeCommon, 2));
        set("brakeDifference", this.formatValue(this.tripletMagnitude(data.brakes), 2));
        set("pitch", this.formatValue(data.pitch, 1) + "°");
        set("angular0", this.formatValue(data.angular[0], 3));
        set("angular5", this.formatValue(data.angular[5], 3));
        const vectorValues = [
            [data.rollLR, data.rollAK],
            [data.angular[3], data.angular[4]],
            [data.speedLR, data.speedAK],
            [data.angular[1], data.angular[2]]
        ];
        HUD_LAYOUT.vector.instruments.forEach((instrument, index) => {
            const [x, y] = vectorValues[index];
            const vector = this.vectors.get(instrument.key);
            vector.value.textContent = this.formatValue(Math.hypot(x, y), 3);
            this.updateVector(instrument.key, x, y);
        });
        const horizontalValues = {
            speedForward: data.speedForward,
            angular5: data.angular[5]
        };
        HUD_LAYOUT.horizontalBar.instruments.forEach((instrument, index) => {
            const center = {
                x: HUD_LAYOUT.horizontalBar.firstCenter.x + index * HUD_LAYOUT.horizontalBar.gapX,
                y: HUD_LAYOUT.horizontalBar.firstCenter.y
            };
            this.updateTape(instrument.key, horizontalValues[instrument.key], center, instrument.step);
        });
        const verticalValues = {
            height: data.height,
            pitch: data.pitch,
            speedVertical: data.speedVertical,
            angular0: data.angular[0]
        };
        HUD_LAYOUT.verticalBar.instruments.forEach((instrument, index) => {
            this.updateVerticalTape(instrument.key, verticalValues[instrument.key], index, instrument.step);
        });
        for (const name of ["throttle", "flap"]) {
            const marker = this.root.querySelector(`[data-marker="${name}"]`);
            const value = { throttle: data.throttle, flap: data.flap }[name];
            const x = HUD_LAYOUT.controls[name].x + HUD_LAYOUT.controls.bar.length * value;
            marker.setAttribute("x1", `${x}`);
            marker.setAttribute("x2", `${x}`);
        }
        const aileronLayout = this.tripletLayout("aileron");
        const brakeLayout = this.tripletLayout("brake");
        this.updateTriplet("aileron", ailerons, aileronLayout, this.aileronDifferenceScale);
        this.updateTriplet("brake", data.brakes, brakeLayout, 1);
        this.updateCommonMarker("aileron", aileronCommon, aileronLayout);
        this.updateCommonMarker("brake", brakeCommon, brakeLayout);
    }
    transitionAilerons(target) {
        const now = performance.now();
        if (!this.displayedAilerons) {
            this.displayedAilerons = [...target];
            this.lastAileronUpdate = now;
            return this.displayedAilerons;
        }
        const duration = HUD_LAYOUT.triplet.transitionMs;
        const amount = 1 - Math.exp(-(now - this.lastAileronUpdate) / (duration / 3));
        this.lastAileronUpdate = now;
        this.displayedAilerons = this.displayedAilerons.map((value, index) => value + (target[index] - value) * amount);
        return this.displayedAilerons;
    }
    updateCommonMarker(name, value, layout) {
        const marker = this.commonMarkers.get(name);
        const cy = layout.center.y + layout.commonZeroOffsetY - value / HUD_LAYOUT.triplet.commonRange * layout.commonTravel;
        marker.setAttribute("y1", `${cy}`);
        marker.setAttribute("y2", `${cy}`);
    }
    tripletMagnitude(values) {
        const x = values[0] - (values[1] + values[2]) / 2;
        const y = (values[1] - values[2]) * Math.sqrt(3) / 2;
        return Math.hypot(x, y);
    }
    updateTape(name, value, center, step) {
        const tape = this.bars.get(name);
        const layout = HUD_LAYOUT.horizontalBar;
        const base = Math.round(value / step);
        const fraction = value / step - base;
        tape.innerHTML = "";
        for (let i = -2; i <= 2; i++) {
            const x = center.x + i * layout.tickSpacing - fraction * layout.tickSpacing;
            const tickValue = (base + i) * step;
            tape.insertAdjacentHTML("beforeend", `<line x1="${x}" y1="${center.y - layout.halfHeight}" x2="${x}" y2="${center.y + layout.halfHeight}" stroke="var(--hud-grid)"/><text x="${x}" y="${center.y + layout.labelOffsetY}" text-anchor="middle" fill="var(--hud-text)" stroke="none" font-size="6">${this.formatValue(tickValue, step < 1 ? 2 : 0)}</text>`);
        }
    }
    updateVerticalTape(name, value, index, step) {
        const tape = this.bars.get(name);
        const layout = HUD_LAYOUT.verticalBar;
        const x = layout.firstCenter.x + index * layout.gapX;
        const base = Math.round(value / step);
        const fraction = value / step - base;
        tape.innerHTML = "";
        for (let i = -2; i <= 2; i++) {
            const y = layout.firstCenter.y - i * layout.tickSpacing + fraction * layout.tickSpacing;
            const tickValue = (base + i) * step;
            const x1 = x - layout.tickHalfWidth, x2 = x + layout.tickHalfWidth;
            tape.insertAdjacentHTML("beforeend", `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--hud-grid)"/><text x="${x2 + layout.labelOffset.x}" y="${y + layout.labelOffset.y}" fill="var(--hud-text)" stroke="none" font-size="6">${this.formatValue(tickValue, step < 1 ? 2 : 0)}</text>`);
        }
    }
    updateVector(name, xValue, yValue) {
        const vector = this.vectors.get(name);
        vector.needle.setAttribute("x2", `${vector.x + xValue / vector.scale * vector.radius}`);
        vector.needle.setAttribute("y2", `${vector.y - yValue / vector.scale * vector.radius}`);
    }
    updateTriplet(name, values, layout, differenceScale) {
        const center = layout.center;
        const unit = HUD_LAYOUT.triplet.directions.map(angle => ({ x: Math.cos(angle), y: -Math.sin(angle) }));
        const thumbs = this.sliders.get(name);
        let dx = 0, dy = 0;
        for (let i = 0; i < 3; i++) {
            const slider = layout.centered ? Math.max(-1, Math.min(1, values[i])) : Math.max(0, Math.min(1, values[i]));
            const displayValue = layout.centered ? Math.sign(slider) * Math.cbrt(Math.abs(slider)) : slider;
            const distance = displayValue * HUD_LAYOUT.triplet.radius;
            thumbs[i].setAttribute("cx", `${center.x + unit[i].x * distance}`);
            thumbs[i].setAttribute("cy", `${center.y + unit[i].y * distance}`);
            dx += values[i] * unit[i].x;
            dy += values[i] * unit[i].y;
        }
        const scale = HUD_LAYOUT.triplet.differenceScaleFactor / differenceScale;
        const magnitude = Math.hypot(dx, dy);
        const maxMagnitude = differenceScale;
        if (magnitude > maxMagnitude) {
            dx *= maxMagnitude / magnitude;
            dy *= maxMagnitude / magnitude;
        }
        this.differences.get(name).setAttribute("cx", `${center.x + dx * scale}`);
        this.differences.get(name).setAttribute("cy", `${center.y + dy * scale}`);
    }
}
async function loadFile(src) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        console.log("loading: " + src);
        xhr.open("GET", src, true);
        xhr.onload = e => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                }
                else {
                    console.error(xhr.statusText);
                    reject();
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
            reject();
        };
        xhr.send();
    });
}
const phyHelper = [];
export var aircraft;
(function (aircraft_1) {
    async function load() {
        const canvas = document.getElementById("gpu-canvas");
        const app = await FOUR.App.create({ canvas, controllerConfig: { preventDefault: true } });
        app.renderer.core.setDisplayConfig({ opacity: 12 });
        app.renderer.setBackgroundColor([0, 0, 0, 0.2]);
        const scene = app.scene;
        const gnd = new FOUR.CubeGeometry(20000);
        scene.add(new FOUR.Mesh(gnd, new FOUR.LambertMaterial(new FOUR.CheckerTexture(new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 1, 0.1], [0.9, 0.8, 0.8, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.5, 0.3, 0.3, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.CheckerTexture(new FOUR.CheckerTexture([1, 1, 0.6, 0.1], [0.9, 0.8, 0.4, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(1000, 1000, 1000, 1000)))), [0.3, 0.7, 0.7, 0.1], new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(100, 100, 100, 100)))), new FOUR.Vec4TransformNode(new FOUR.UVWVec4Input(), new Obj4(null, null, new Vec4(10, 10, 10, 10)))))));
        const camera = app.camera;
        camera.near = 0.2;
        camera.far = 5000;
        camera.fov = 90;
        scene.skyBox = new FOUR.SimpleSkyBox();
        scene.skyBox.setOpacity(0.05);
        scene.add(new FOUR.AmbientLight(0.2));
        scene.add(new FOUR.DirectionalLight([1.0, 0.9, 0.8], new Vec4(0.2, 1.0, 0.3, 0.4).norms()));
        scene.add(new FOUR.DirectionalLight([0.1, 0.1, 0.1], new Vec4(-0.219, -1.0, -0.35, -0.3).norms()));
        const aircraftMesh1 = await genAircraftMesh();
        const aircraftMesh2 = await genAircraftMesh();
        const { mesh: aircraftTrack1, wireframe: trackFrame1 } = genAircraftTrack();
        const { mesh: aircraftTrack2, wireframe: trackFrame2 } = genAircraftTrack();
        const { mesh: aircraftTrack3, wireframe: trackFrame3 } = genAircraftTrack();
        const { mesh: aircraftTrack4, wireframe: trackFrame4 } = genAircraftTrack();
        aircraftTrack1.position.w -= 290;
        aircraftTrack2.position.w -= 3000;
        aircraftTrack4.position.w -= 4400;
        aircraftTrack4.position.z -= 300;
        aircraftTrack4.position.x -= 500;
        aircraftTrack4.rotatesb(Bivec.zw.mulf(-Math.PI / 180 * 4).adds(Bivec.xw.mulf(-Math.PI / 180 * 5)));
        aircraftTrack4.position.w -= 4400;
        aircraftTrack3.position.w -= 3700;
        aircraftTrack3.position.x -= 100;
        aircraftTrack3.rotatesb(Bivec.xw.mulf(-Math.PI / 180 * 3));
        scene.wireframe = new FOUR.WireFrameScene();
        scene.wireframe.add(trackFrame1);
        scene.wireframe.add(trackFrame2);
        scene.wireframe.add(trackFrame3);
        scene.wireframe.add(trackFrame4);
        scene.add(aircraftMesh1, aircraftMesh2, aircraftTrack1, aircraftTrack2, aircraftTrack3, aircraftTrack4);
        aircraftMesh1.position.y += 2.2;
        aircraftMesh2.position.z += 200;
        aircraftMesh2.position.y += 2.2;
        const engine = new PHY.Engine({ forceAccumulator: PHY.force_accumulator.RK4 });
        const world = new PHY.World();
        world.add(new PHY.Rigid({
            mass: 0,
            geometry: new PHY.rigid.Plane(Vec4.y, 0.3),
            material: new PHY.Material(1, 0.3)
        }));
        const aircraftP = new PHY.Rigid({
            mass: 2, geometry: new PHY.rigid.Tesseractoid(new Vec4(2, 1, 2, 5)),
            material: new PHY.Material(1, 0.5)
        });
        // world.gravity.set(0);
        // phyHelper.push([aircraftP, new FOUR.Mesh(new FOUR.TesseractGeometry(new Vec4(2, 1, 2, 5)), new tesserxel.four.LambertMaterial([1, 1, 1, 1]))]);
        const gearwheelTireGeom = new FOUR.SpheritorusGeometry(0.12, 0.3);
        const gearwheelTireMat = new FOUR.PhongMaterial([1.0, 0, 0, 1], 9);
        const initHeight = 1.25;
        const springts = [];
        const damping = new PHY.Damping(0, 0.001);
        function makeGearP(mass, x, z, w) {
            const wheelP1 = new PHY.Rigid({
                mass: mass, geometry: new PHY.rigid.Spheritorus(0.3, 0.12),
                material: new PHY.Material(1, 0.5)
            });
            // phyHelper.push([wheelP1, new FOUR.Mesh(gearwheelTireGeom, gearwheelTireMat)]);
            wheelP1.rotatesb(Bivec.xy.mulf(Math.PI / 2)).translates(new Vec4(x, initHeight - 1.6 + 1, z, w));
            world.add(wheelP1);
            // world.add(new PHY.PointConstrain(wheelP1, aircraftP, new Vec4(), new Vec4(x, -1.6, z, w)));
            const sp = new PHY.Spring(wheelP1, aircraftP, new Vec4(), new Vec4(x, -1.6, z, w), 1000, 0, 10);
            const spt = new PHY.TorqueSpring(wheelP1, aircraftP, Bivec.xw, Bivec.wy, 5, 0.0005);
            world.add(sp);
            damping.add(wheelP1);
            // window["springs"].push(sp);
            springts.push(spt);
            world.add(spt);
        }
        world.add(damping);
        makeGearP(0.1, 0, 0, -6.6);
        makeGearP(0.6, 1.4 * 2, 0, 1.1);
        makeGearP(0.6, -0.7 * 2, 0.7 * 2 * Math.sqrt(3), 1.1);
        makeGearP(0.6, -0.7 * 2, -0.7 * 2 * Math.sqrt(3), 1.1);
        aircraftP.position.y = initHeight + 1;
        camera.position.w = -4.7;
        camera.position.y = aircraftP.position.y;
        camera.position.x = 8;
        camera.lookAt(Vec4.wNeg, aircraftP.position);
        camera.position.w = -6.7;
        camera.position.z = -2;
        const freeCamCtrl = new tesserxel.ui.ctrl.KeepUpController(camera);
        freeCamCtrl.keyMoveSpeed *= 5;
        const hud = document.createElement("div");
        document.body.appendChild(hud);
        hud.style.position = "fixed";
        hud.style.top = "80px";
        hud.style.left = "0px";
        hud.style.fontSize = "0.6em";
        hud.style.color = "#FFF";
        const aircraftCtrl = new AircraftCtrl(aircraftP, freeCamCtrl, canvas, hud, camera);
        const aircraftMecanism = new AircraftMecanism(aircraftCtrl);
        world.add(aircraftP, aircraftMecanism);
        app.controllerRegistry.add(freeCamCtrl);
        app.controllerRegistry.add(aircraftCtrl);
        aircraftMesh1.alwaysUpdateCoord = true;
        for (const [p, o] of phyHelper) {
            scene.add(o);
            o.alwaysUpdateCoord = true;
        }
        app.retinaController.toggleCrosshair();
        function run() {
            const dt = Math.min(app.controllerRegistry.states.mspf * 0.001 / 3, 1 / 60);
            aircraftCtrl.dt = dt;
            app.controllerRegistry.update();
            engine.update(world, dt);
            for (const [p, o] of phyHelper) {
                o.copyObj4(p);
            }
            app.renderer.render(scene, camera);
            aircraftMesh1.copyObj4(aircraftP).translates(new Vec4(0, 0, 0, -3).rotates(aircraftP.rotation));
            window.requestAnimationFrame(run);
            if (aircraftCtrl.camLock) {
                if (aircraftCtrl.camPos !== -1)
                    freeCamCtrl.updateObj();
                switch (aircraftCtrl.camPos) {
                    // driver
                    case 0:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.01, 1, 0.01, -8).rotates(camera.rotation));
                        break;
                    // behind
                    case 1:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, 0, 0.01, 11).rotates(camera.rotation));
                        break;
                    // behind + height
                    case 2:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, 3, 0.01, 9).rotates(camera.rotation));
                        camera.lookAt(Vec4.wNeg, aircraftP.position);
                        break;
                    // front gear
                    case 3:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, -1.5, 0.01, -4).rotates(camera.rotation));
                        break;
                    // back gears
                    case 4:
                        camera.copyObj4(aircraftP);
                        camera.position.adds(new Vec4(0.011, -1.5, 0.01, 2).rotates(camera.rotation));
                        break;
                    // top
                    case 5:
                        camera.copyObj4(aircraftP);
                        camera.position.y += 10;
                        camera.lookAt(Vec4.wNeg, aircraftP.position);
                        break;
                }
            }
            // increase gear stability
            for (const st of springts) {
                const srcB = st.planeA.rotate(st.a.rotation);
                const dstB = st.planeB.clone();
                if (st.b)
                    dstB.rotates(st.b.rotation);
                const bivf = srcB.cross(dstB);
                let dw = (st.b ? st.a.angularVelocity.sub(st.b.angularVelocity) : st.a.angularVelocity).dot(bivf);
                const ns = bivf.norm();
                if (ns > 1e-1 && dw / ns > 0.1) {
                    dw /= ns * ns;
                    st.a.angularVelocity.addmulfs(bivf, -dw);
                }
                st.a.angularVelocity.copy(st.b.angularVelocity);
                st.a.rotation.copy(st.b.rotation).mulsr(Bivec.xy.mulf(Math.PI / 2).exp());
            }
            freeCamCtrl.enabled = !aircraftCtrl.camLock;
        }
        run();
    }
    aircraft_1.load = load;
    async function genAircraftMesh() {
        const resources = await Promise.all([
            loadFile("resource/aircraft_body.obj"),
            loadFile("resource/aircraft_engine.obj")
        ]);
        const aircraft = new FOUR.Object();
        const aircraftMat = new FOUR.LambertMaterial([1, 1, 1, 1]);
        const aircraftBodyMat = new FOUR.PhongMaterial(new FOUR.WgslTexture(`fn aircraftbody_texture(uvw:vec4f)->vec4f{
                let isWindow = uvw.y<0.45 && uvw.y>0.25 && (
                    (fract(uvw.z*3.0)<0.5 && fract(atan2(uvw.w,uvw.x)*${10 / Math.PI}) < 0.5 && uvw.z > -7.0 && uvw.z < 2.6) ||
                    (uvw.z > 4.0 && uvw.z < 4.5 && fract(atan2(uvw.w,uvw.x)*${5 / Math.PI}) < 0.8125) ||
                    (uvw.z > 4.55 && abs(uvw.w)>0.025 && abs(uvw.x)>0.025)
                );
                if(isWindow){
                    return vec4f(0.2,0.2,0.4,1.0);
                }else{
                    return vec4f(1.0,1.0,1.0,1.0);
                }
            }`, "aircraftbody_texture"));
        let aircraftBodyMesh3d = new tesserxel.mesh.FaceIndexMesh(new tesserxel.mesh.ObjFile(resources[0]).parse()).toNonIndexMesh();
        const aircraftBody = new FOUR.Mesh(new FOUR.Geometry(tesserxel.mesh.tetra.rotatoid(new tesserxel.math.Bivec(0, 0, -1), aircraftBodyMesh3d, 36).inverseNormal().setUVWAsPosition()), aircraftBodyMat);
        aircraft.add(aircraftBody.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        /* gear */
        const gearwheelTireGeom = new FOUR.SpheritorusGeometry(0.12, 0.3);
        const gearwheelAxleGeom = new FOUR.DuocylinderGeometry(0.05, 0.3);
        const gearwheelTireMat = new FOUR.PhongMaterial([0.2, 0.2, 0.2, 1], 9);
        const steelMat = new FOUR.PhongMaterial([0.5, 0.5, 0.5, 1], 20);
        function makeGearWheelMesh() {
            const gearWheel = new FOUR.Object();
            gearWheel.add(new FOUR.Mesh(gearwheelTireGeom, gearwheelTireMat).rotatesb(Bivec.xy.add(Bivec.zw).mulfs(Math.PI / 2)), new FOUR.Mesh(gearwheelAxleGeom, steelMat).rotatesb(Bivec.yw.mulf(Math.PI / 2)));
            return gearWheel;
        }
        const dist = 0.3;
        function makeGearTriple() {
            const gearTriple = new FOUR.Object();
            const w1 = makeGearWheelMesh().translates(new Vec4(dist));
            const w2 = makeGearWheelMesh().translates(new Vec4(-dist / 2, 0, 0, dist / 2 * Math.sqrt(3)));
            const w3 = makeGearWheelMesh().translates(new Vec4(-dist / 2, 0, 0, -dist / 2 * Math.sqrt(3)));
            const axle1 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(dist / 2));
            axle1.scale = new Vec4(dist / 2, 0.05, 0.05, 0.05);
            const axle2 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(-dist / 4, 0, 0, dist / 4 * Math.sqrt(3))).rotatesb(Bivec.xw.mulf(Math.PI / 3 * 2));
            axle2.scale = axle1.scale;
            const axle3 = new FOUR.Mesh(geomTesseract, steelMat).translates(new Vec4(-dist / 4, 0, 0, -dist / 4 * Math.sqrt(3))).rotatesb(Bivec.wx.mulf(Math.PI / 3 * 2));
            axle3.scale = axle1.scale;
            const axleVertical = new FOUR.Mesh(geomTesseract, steelMat);
            axleVertical.scale = new Vec4(0.05, 0.53, 0.05, 0.05);
            axleVertical.position.y += 0.53;
            gearTriple.add(w1, w2, w3, axle1, axle2, axle3, axleVertical);
            return gearTriple;
        }
        const frontGear = makeGearTriple();
        frontGear.position.y = -1.6;
        frontGear.position.z = 3.6;
        aircraft.add(frontGear.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        /* wing */
        // wing body
        const aircraftWingCW = tesserxel.mesh.cw.path(4);
        aircraftWingCW.topologicalExtrude();
        aircraftWingCW.topologicalExtrude();
        aircraftWingCW.topologicalExtrude();
        const wingData = [
            new Vec4(0.0348, -0.6680, 0.6526),
            new Vec4(0.0243, -0.3925, 0.6526),
            new Vec4(0.0348, -0.6680, 4.6567),
            new Vec4(0.0243, -0.3925, 4.6567),
            new Vec4(9.2627, 1.2190, 7.2942),
            new Vec4(9.2397, 1.2284, 7.2942),
            new Vec4(9.2627, 1.2190, 7.5128),
            new Vec4(9.2397, 1.2284, 7.5128),
            new Vec4(2.0479, -0.4589, 4.6502),
            new Vec4(2.0479, -0.3034, 1.8070),
            new Vec4(2.0479, -0.3034, 4.6502),
            new Vec4(2.0479, -0.4589, 1.8070),
            new Vec4(9.0879, 0.2082, 7.1657),
            new Vec4(9.1502, 0.1570, 6.5423),
            new Vec4(9.1502, 0.1570, 7.1657),
            new Vec4(9.0879, 0.2082, 6.5423),
        ];
        const wingWData = [-0.5953, 0.5427, -0.5953, 0.5427, 0.0053, 0.0714, 0.0053, 0.0714, -0.7801, 0.6841, 0.6841, -0.7801, 0.1446, -0.1557, -0.1557, 0.1446];
        const wingDataIdx = [0, 11, 13, 4, 1, 9, 15, 5, 2, 8, 14, 6, 3, 10, 12, 7];
        aircraftWingCW.data[0] = wingDataIdx.map((i, id) => new Vec4(wingData[i].x, wingData[i].y, -wingData[i].z, wingWData[wingDataIdx[id & 11]]));
        aircraftWingCW.data[0].push(...wingDataIdx.map((i, id) => new Vec4(wingData[i].x, wingData[i].y, -wingData[i].z, wingWData[wingDataIdx[id | 4]])));
        const aircraftWingGeom = new FOUR.Geometry(tesserxel.mesh.tetra.cwmesh(aircraftWingCW));
        // engine
        let aircraftEngineMesh3d = new tesserxel.mesh.FaceIndexMesh(new tesserxel.mesh.ObjFile(resources[1]).parse()).toNonIndexMesh();
        const aircraftEngineShellGeom = new FOUR.Geometry(tesserxel.mesh.tetra.rotatoid(Bivec.yw, aircraftEngineMesh3d, 24));
        // tail
        const aircraftHTailCW = tesserxel.mesh.cw.path(2);
        aircraftHTailCW.topologicalExtrude();
        aircraftHTailCW.topologicalExtrude();
        aircraftHTailCW.topologicalExtrude();
        const HTailData = [
            new Vec4(0.2340, 8.9022, 0.0273),
            new Vec4(0.2340, 8.9022, -0.0273),
            new Vec4(0.2300, 10.4590, 0.0273),
            new Vec4(0.2300, 10.4590, -0.0273),
            new Vec4(3.0098, 11.2470, 0.2971),
            new Vec4(3.0098, 11.2470, 0.2772),
            new Vec4(3.0098, 11.6961, 0.2971),
            new Vec4(3.0098, 11.6961, 0.2772),
        ];
        const HTailWData = [-0.4032, -1.0720, -0.5369, -0.9383, -0.5978, -0.8757, -0.6288, -0.8448];
        const HTailDataIdx = [0, 1, 2, 3, 4, 5, 6, 7];
        aircraftHTailCW.data[0] = HTailDataIdx.map((i, id) => new Vec4(HTailData[i].x, 0.735556 + HTailData[i].z, -HTailData[i].y, 0.735556 + HTailWData[HTailDataIdx[id & 14]]));
        aircraftHTailCW.data[0].push(...HTailDataIdx.map((i, id) => new Vec4(HTailData[i].x, 0.735556 + HTailData[i].z, -HTailData[i].y, 0.735556 + HTailWData[HTailDataIdx[id | 1]])));
        const TailGeom = new FOUR.Geometry(tesserxel.mesh.tetra.cwmesh(aircraftHTailCW));
        let position = new Vec4(-0.6, 0.44, 0, -0.73);
        function makeWing() {
            const wing = new FOUR.Object();
            const aircraftEngine1 = new FOUR.Mesh(aircraftEngineShellGeom, aircraftMat);
            aircraftEngine1.position.set(2.3, -0.9, -0.6, -0.4);
            aircraftEngine1.scale = new Vec4(1.3, 1, 1, 1);
            aircraftEngine1.rotatesb(Bivec.xw.mulf(Math.PI / 2));
            const aircraftEngine2 = new FOUR.Mesh(aircraftEngineShellGeom, aircraftMat);
            aircraftEngine2.position.set(4.5, -0.6, -2.1, -0.4);
            aircraftEngine2.scale = new Vec4(1.3, 1, 1, 1).mulfs(0.8);
            aircraftEngine2.rotatesb(Bivec.xw.mulf(Math.PI / 2));
            const aircraftWingBody = new FOUR.Mesh(aircraftWingGeom, aircraftMat);
            const gear = makeGearTriple();
            gear.position.set(1.4, -1.6, -4);
            const HTail = new FOUR.Mesh(TailGeom, aircraftMat).rotatesb(Bivec.xw.mulf(Math.PI / 3));
            const VTail = new FOUR.Mesh(TailGeom, aircraftMat).rotatesb(Bivec.yw.mulf(Math.PI / 2)).rotatesb(Bivec.xy.mulf(Math.PI / 5));
            VTail.position.set(-0.2, 0.44, 0, -0.77);
            wing.add(aircraftEngine1, aircraftEngine2, aircraftWingBody, gear, HTail, VTail);
            return wing;
        }
        aircraft.add(makeWing().rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        aircraft.add(makeWing().rotatesb(Bivec.xw.mulf(Math.PI / 3 * 2)).rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        aircraft.add(makeWing().rotatesb(Bivec.wx.mulf(Math.PI / 3 * 2)).rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp()));
        return aircraft;
    }
    function genAircraftTrack() {
        const track = new FOUR.Mesh(new tesserxel.four.CubeGeometry(new tesserxel.math.Vec3(13, 300, 13)), new FOUR.LambertMaterial(new FOUR.WgslTexture(`fn track(uvw:vec4f)->vec4f{
                let auvw = abs(uvw);
                let distance = max(auvw.x,auvw.z);
                let isWhite = (
                    ((auvw.x<0.01 && auvw.z<0.1) || (auvw.x<0.1 && auvw.z<0.01)) && fract(uvw.y*30.0)<0.5 && auvw.y<0.9
                ) || (abs(auvw.x-0.75)<0.01 && auvw.z<0.76) || (abs(auvw.z-0.75)<0.01 && auvw.x<0.76)
                  || (fract(auvw.x*12.0)>0.5 && fract(auvw.z*12.0)>0.5 && abs(auvw.y- 0.935)<0.015 && auvw.z<0.67 && auvw.x<0.67)
                  || (distance < 0.4 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && (abs(auvw.y- 0.78)<0.015 || abs(auvw.y- 0.61)<0.015) ) ||
                    (abs(auvw.y- 0.47)<0.015)
                    ))
                  || (distance < 0.3 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && abs(auvw.y- 0.35)<0.015)
                    ))
                  || (distance < 0.2 && distance > 0.1 && (
                    (fract(distance*10.0)>0.5 && abs(auvw.y- 0.22)<0.015)
                    ))
                ;
                if(isWhite){
                    return vec4f(1.0,1.0,1.0,5.0);
                }else{
                    return vec4f(0.3,0.3,0.3,0.2);
                }
            }
            `, "track")));
        track.position.y = 0.3;
        track.rotatesAt(Bivec.wz.mulf(Math.PI / 2).exp());
        const wireframe = new FOUR.WireFrameTesseractoid(new tesserxel.math.Vec4(13, 0.2, 400, 13));
        wireframe.rotation = track.rotation;
        wireframe.position = track.position;
        return { mesh: track, wireframe };
    }
})(aircraft || (aircraft = {}));
class AircraftCtrl {
    crashed = false;
    camLock = false;
    camCtrl;
    canvas;
    keyConfig = {
        throttlep: "ArrowUp",
        throttlem: "ArrowDown",
        elevatorp: "KeyW",
        elevatorm: "KeyS",
        aileronXm: "KeyA",
        aileronXp: "KeyD",
        aileronYm: "KeyQ",
        aileronYp: "KeyE",
        spinCW: "KeyZ",
        spinCCW: "KeyX",
        flapp: ".KeyF",
        flapm: "ShiftLeft+.KeyF",
        toggleCamlock: ".KeyB",
        fovp: "Digit9",
        fovm: "Digit0",
        camSpeedIncrease: ".Equal",
        camSpeedDecrease: ".Minus",
        camPos: [
            ".Digit1", ".Digit2", ".Digit3",
            ".Digit4", ".Digit5", ".Digit6", ".Digit7"
        ],
        hudToggle: ".KeyH",
        automaticCenter: "KeyC",
        brake: ".KeyK",
        brakeXm: "KeyJ",
        brakeXp: "KeyL",
        brakeYm: "KeyU",
        brakeYp: "KeyO",
    };
    registGui(gui) {
        gui.keybindingMgr.addGroup("aircraft", {
            "title": {
                "zh": "飞行控制", "en": "Aircraft Controls"
            },
            "actions": {
                "toggleCamlock": {
                    "title": { "zh": "切换控制模式", "en": "Toggle Control Mode" },
                    "key": "KeyB",
                    "press": true
                },
                "automaticCenter": {
                    "title": { "zh": "自动回正", "en": "Auto Center" },
                    "key": "KeyC"
                },
                "throttlep": {
                    "title": { "zh": "增加引擎功率", "en": "Increase Throttle" },
                    "key": "ArrowUp"
                },
                "throttlem": {
                    "title": { "zh": "降低引擎功率", "en": "Decrease Throttle" },
                    "key": "ArrowDown"
                },
                "elevatorp": {
                    "title": { "zh": "俯仰上", "en": "Pitch Up" },
                    "key": "KeyW"
                },
                "elevatorm": {
                    "title": { "zh": "俯仰下", "en": "Pitch Down" },
                    "key": "KeyS"
                },
                "aileronXm": {
                    "title": { "zh": "左横滚", "en": "Roll Left" },
                    "key": "KeyA"
                },
                "aileronXp": {
                    "title": { "zh": "右横滚", "en": "Roll Right" },
                    "key": "KeyD"
                },
                "aileronYm": {
                    "title": { "zh": "侧前横滚", "en": "Roll Ana" },
                    "key": "KeyQ"
                },
                "aileronYp": {
                    "title": { "zh": "侧后横滚", "en": "Roll Kata" },
                    "key": "KeyE"
                },
                "spinCW": {
                    "title": { "zh": "顺时针自转", "en": "Spin Clockwise" },
                    "key": "KeyZ"
                },
                "spinCCW": {
                    "title": { "zh": "逆时针自转", "en": "Spin Counterclockwise" },
                    "key": "KeyX"
                },
                "flapp": {
                    "title": { "zh": "襟翼增加", "en": "Flaps Increase" },
                    "key": "KeyF",
                    "press": true
                },
                "flapm": {
                    "title": { "zh": "襟翼减少", "en": "Flaps Decrease" },
                    "key": "LeftShift+KeyF",
                    "press": true
                },
                "brake": {
                    "title": { "zh": "刹车", "en": "Brake" },
                    "key": "KeyK",
                    "press": true
                },
                "brakeXm": {
                    "title": { "zh": "左刹车", "en": "Brake Left" },
                    "key": "KeyJ"
                },
                "brakeXp": {
                    "title": { "zh": "右刹车", "en": "Brake Right" },
                    "key": "KeyL"
                },
                "brakeYm": {
                    "title": { "zh": "侧前刹车", "en": "Brake Ana" },
                    "key": "KeyU"
                },
                "brakeYp": {
                    "title": { "zh": "侧后刹车", "en": "Brake Kata" },
                    "key": "KeyO"
                },
                "fovp": {
                    "title": { "zh": "增加视野角", "en": "Increase FOV" },
                    "key": "Digit9"
                },
                "fovm": {
                    "title": { "zh": "减少视野角", "en": "Decrease FOV" },
                    "key": "Digit0"
                },
                "camSpeedIncrease": {
                    "title": { "zh": "相机移动加速", "en": "Increase Camera Speed" },
                    "key": "Equal",
                    "press": true
                },
                "camSpeedDecrease": {
                    "title": { "zh": "相机移动减速", "en": "Decrease Camera Speed" },
                    "key": "Minus",
                    "press": true
                },
                "hudToggle": {
                    "title": { "zh": "切换HUD显示", "en": "Toggle HUD" },
                    "key": "KeyH",
                    "press": true
                },
            },
            "groups": {
                "camPos": {
                    "title": {
                        "zh": "相机预设位置", "en": "Camera Presets"
                    },
                    "actions": {
                        "1": {
                            "title": { "zh": "相机位置1", "en": "Camera Position 1" },
                            "key": "Digit1",
                            "press": true
                        },
                        "2": {
                            "title": { "zh": "相机位置2", "en": "Camera Position 2" },
                            "key": "Digit2",
                            "press": true
                        },
                        "3": {
                            "title": { "zh": "相机位置3", "en": "Camera Position 3" },
                            "key": "Digit3",
                            "press": true
                        },
                        "4": {
                            "title": { "zh": "相机位置4", "en": "Camera Position 4" },
                            "key": "Digit4",
                            "press": true
                        },
                        "5": {
                            "title": { "zh": "相机位置5", "en": "Camera Position 5" },
                            "key": "Digit5",
                            "press": true
                        },
                        "6": {
                            "title": { "zh": "相机位置6", "en": "Camera Position 6" },
                            "key": "Digit6",
                            "press": true
                        },
                        "7": {
                            "title": { "zh": "相机位置7", "en": "Camera Position 7" },
                            "key": "Digit7",
                            "press": true
                        }
                    }
                }
            }
        });
    }
    camPos = -1;
    camSpeedAdjustFactor = 1.5;
    // x- x+ z- z+ w- w+
    controls = {
        throttle: 0,
        aileron1: 0,
        aileron2: 0,
        aileron3: 0,
        rudderX: 0,
        rudderY: 0,
        flap: 0,
        spinnor: 0,
        brake1: 0,
        brake2: 0,
        brake3: 0,
    };
    rigid;
    hudDom;
    hud;
    camera;
    rollXPID;
    rollYPID;
    dt = 1 / 60;
    brake = false;
    constructor(rigid, camCtrl, canvas, hudDom, camera) {
        this.rigid = rigid;
        this.camCtrl = camCtrl;
        this.canvas = canvas;
        this.hudDom = hudDom;
        this.hud = new AircraftHud(hudDom);
        this.camera = camera;
        this.rollXPID = new PIDCtrl(0.5, 0.01, 0.2);
        this.rollYPID = new PIDCtrl(0.5, 0.01, 0.2);
    }
    update(state) {
        this.updateHud(state);
        if (state.isActionActive("hudToggle", "aircraft")) {
            this.hudDom.style.display = this.hudDom.style.display === "none" ? "" : "none";
        }
        if (state.isActionActive("toggleCamlock", "aircraft")) {
            this.camLock = !this.camLock;
            this.camPos = -1;
        }
        for (let i = 0; i < 7; i++) {
            if (state.isActionActive("camPos." + (i + 1), "aircraft")) {
                this.camPos = i === 7 ? -1 : i;
                if (i !== 7)
                    this.camLock = true;
            }
        }
        if (!this.camLock) {
            if (state.isActionActive("camSpeedDecrease", "aircraft")) {
                this.camCtrl.keyMoveSpeed /= this.camSpeedAdjustFactor;
            }
            if (state.isActionActive("camSpeedIncrease", "aircraft")) {
                this.camCtrl.keyMoveSpeed *= this.camSpeedAdjustFactor;
            }
        }
        const fovDelta = 5;
        if (state.isActionActive("fovm", "aircraft")) {
            this.camera.fov += fovDelta;
            this.camera.needsUpdate = true;
        }
        else if (state.isActionActive("fovp", "aircraft")) {
            this.camera.fov -= fovDelta;
            this.camera.needsUpdate = true;
        }
        if (this.camLock) {
            const throttleDelta = 0.03;
            const elevatorDelta = 0.003;
            const aileronDelta = 0.003;
            const brakeDelta = 0.08;
            const rudderDelta = 0.1;
            const flapDelta = 0.2;
            const spinDelta = 1;
            if (state.isActionActive("throttlep", "aircraft")) {
                this.controls.throttle += throttleDelta;
            }
            else if (state.isActionActive("throttlem", "aircraft")) {
                this.controls.throttle -= throttleDelta;
            }
            const param = {
                vdp: 0.8,
                vda: 0.2,
            };
            // const wrel = this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation);
            this.controls.aileron1 = 0;
            this.controls.aileron2 = 0;
            this.controls.aileron3 = 0;
            this.controls.rudderX = 0;
            this.controls.rudderY = 0;
            if (state.currentBtn !== -1) {
                const aileronDeltaMouseX = (state.moveX) * 0.0001;
                const aileronDeltaMouseY = (state.moveY) * 0.0001;
                this.controls.aileron1 -= aileronDeltaMouseX;
                this.controls.aileron2 += aileronDeltaMouseX / 2;
                this.controls.aileron3 += aileronDeltaMouseX / 2;
                this.controls.aileron2 += aileronDeltaMouseY / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronDeltaMouseY / 2 * Math.sqrt(3);
                this.controls.rudderX -= aileronDeltaMouseX / aileronDelta * rudderDelta;
                this.controls.rudderY += aileronDeltaMouseX / aileronDelta * rudderDelta;
            }
            let dPitchTarget = 0; // target pitch variation
            if (state.isKeyHold(this.keyConfig.elevatorp)) {
                dPitchTarget = -param.vdp;
            }
            else if (state.isKeyHold(this.keyConfig.elevatorm)) {
                dPitchTarget = param.vdp;
            }
            this.controls.aileron1 += dPitchTarget;
            this.controls.aileron2 += dPitchTarget;
            this.controls.aileron3 += dPitchTarget;
            if (state.isActionActive("aileronXm", "aircraft")) {
                this.controls.rudderX = rudderDelta;
            }
            else if (state.isActionActive("aileronXp", "aircraft")) {
                this.controls.rudderX = -rudderDelta;
            }
            if (state.isActionActive("aileronYm", "aircraft")) {
                this.controls.rudderY = -rudderDelta;
            }
            else if (state.isActionActive("aileronYp", "aircraft")) {
                this.controls.rudderY = rudderDelta;
            }
            if (state.isActionActive("aileronYm", "aircraft")) {
                this.controls.aileron2 -= aileronDelta / 2 * Math.sqrt(3);
                this.controls.aileron3 += aileronDelta / 2 * Math.sqrt(3);
            }
            else if (state.isActionActive("aileronYp", "aircraft")) {
                this.controls.aileron2 += aileronDelta / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronDelta / 2 * Math.sqrt(3);
            }
            if (state.isActionActive("aileronXm", "aircraft")) {
                this.controls.aileron1 += aileronDelta;
                this.controls.aileron2 -= aileronDelta / 2;
                this.controls.aileron3 -= aileronDelta / 2;
            }
            else if (state.isActionActive("aileronXp", "aircraft")) {
                this.controls.aileron1 -= aileronDelta;
                this.controls.aileron2 += aileronDelta / 2;
                this.controls.aileron3 += aileronDelta / 2;
            }
            if (state.isActionActive("flapm", "aircraft")) {
                this.controls.flap -= flapDelta;
            }
            else if (state.isActionActive("flapp", "aircraft")) {
                this.controls.flap += flapDelta;
            }
            this.controls.spinnor = 0;
            if (state.isActionActive("spinCCW", "aircraft")) {
                this.controls.spinnor = spinDelta;
            }
            else if (state.isActionActive("spinCW", "aircraft")) {
                this.controls.spinnor = -spinDelta;
            }
            if (state.isActionActive("brake", "aircraft")) {
                this.brake = !this.brake;
            }
            if (this.brake) {
                this.controls.brake1 = 0.7;
                this.controls.brake2 = 0.7;
                this.controls.brake3 = 0.7;
                if (state.isActionActive("brakeXm", "aircraft")) {
                    this.controls.brake1 -= brakeDelta * 6;
                }
                if (state.isActionActive("brakeXp", "aircraft")) {
                    this.controls.brake2 -= brakeDelta * 6;
                    this.controls.brake3 -= brakeDelta * 6;
                }
                if (state.isActionActive("brakeYp", "aircraft")) {
                    this.controls.brake2 -= brakeDelta * 4;
                    this.controls.brake1 -= brakeDelta * 2;
                }
                if (state.isActionActive("brakeYm", "aircraft")) {
                    this.controls.brake3 -= brakeDelta * 4;
                    this.controls.brake1 -= brakeDelta * 2;
                }
            }
            else {
                this.controls.brake1 = 0;
                this.controls.brake2 = 0;
                this.controls.brake3 = 0;
                if (state.isActionActive("brakeXp", "aircraft")) {
                    this.controls.brake1 += brakeDelta * 6;
                }
                if (state.isActionActive("brakeXm", "aircraft")) {
                    this.controls.brake2 += brakeDelta * 6;
                    this.controls.brake3 += brakeDelta * 6;
                }
                if (state.isActionActive("brakeYm", "aircraft")) {
                    this.controls.brake2 += brakeDelta * 4;
                    this.controls.brake1 += brakeDelta * 2;
                }
                if (state.isActionActive("brakeYp", "aircraft")) {
                    this.controls.brake3 += brakeDelta * 4;
                    this.controls.brake1 += brakeDelta * 2;
                }
            }
            if (state.isActionActive("automaticCenter", "aircraft")) {
                let rollX = Math.acos(Vec4.x.rotate(this.rigid.rotation).y) - Math.PI / 2;
                let rollY = Math.acos(Vec4.z.rotate(this.rigid.rotation).y) - Math.PI / 2;
                const aileronX = this.rollXPID.step(0 - rollX, this.dt);
                const aileronY = -this.rollYPID.step(0 - rollY, this.dt);
                this.controls.aileron1 -= aileronX;
                this.controls.aileron2 += aileronX / 2;
                this.controls.aileron3 += aileronX / 2;
                this.controls.aileron2 += aileronY / 2 * Math.sqrt(3);
                this.controls.aileron3 -= aileronY / 2 * Math.sqrt(3);
            }
            // let daXTarget = 0;//(state.mouseX - this.canvas.clientWidth / 2) * 0.0001;
            // let daYTarget = 0;//(state.mouseY - this.canvas.clientHeight / 2) * 0.0001;
            //daXTarget*0.1;//-this.aileronXPID.step(daXTarget - wrel.xy);
            // let daYTarget = 0; // target ax variation
            // if (state.isKeyHold(this.keyConfig.aileronYm)) {
            //     daYTarget = -param.vda;
            // } else if (state.isKeyHold(this.keyConfig.aileronYp)) {
            //     daYTarget = param.vda;
            // }
            // daYTarget += state.moveX * 0.02;
            // this.controls.aileronX = this.aileronXPID.step(daXTarget - rollX);
            // this.controls.aileronY = -this.aileronYPID.step(daYTarget - rollY);
            // this.controls.rudderX = (state.mouseX - this.canvas.clientWidth / 2) * 0.0001;
            // this.controls.rudderY = 0;
        }
        this.controls.throttle = Math.min(Math.max(this.controls.throttle, 0), 1);
        this.controls.aileron1 = Math.min(Math.max(this.controls.aileron1, -1), 1);
        this.controls.aileron2 = Math.min(Math.max(this.controls.aileron2, -1), 1);
        this.controls.aileron3 = Math.min(Math.max(this.controls.aileron3, -1), 1);
        this.controls.rudderX = Math.min(Math.max(this.controls.rudderX, -1), 1);
        this.controls.rudderY = Math.min(Math.max(this.controls.rudderY, -1), 1);
        this.controls.spinnor = Math.min(Math.max(this.controls.spinnor, -1), 1);
        this.controls.flap = Math.min(Math.max(this.controls.flap, 0), 1);
        this.camera.fov = Math.min(Math.max(this.camera.fov, 5), 150);
    }
    updateHud(state) {
        const _v = Vec4.w.rotate(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const speedForward = -this.rigid.velocity.dot(_v);
        _v.copy(Vec4.x).rotates(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const speedLR = this.rigid.velocity.dot(_v);
        _v.copy(Vec4.z).rotates(this.rigid.rotation);
        _v.y = 0;
        _v.norms();
        const speedAK = this.rigid.velocity.dot(_v);
        const angular = this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation);
        this.hud.update({
            fov: this.camera.fov,
            aircraftMode: this.camLock,
            cameraModeKey: state.getActionKey("toggleCamlock", "aircraft"),
            cameraPresetKeys: Array.from({ length: 7 }, (_, index) => state.getActionKey(`${index + 1}`, "aircraft.camPos")),
            throttle: this.controls.throttle,
            flap: this.controls.flap,
            ailerons: [this.controls.aileron1, this.controls.aileron2, this.controls.aileron3],
            brakes: [this.controls.brake1, this.controls.brake2, this.controls.brake3],
            height: this.rigid.position.y,
            pitch: Math.acos(Vec4.w.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90,
            rollLR: Math.acos(Vec4.x.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90,
            rollAK: Math.acos(Vec4.z.rotate(this.rigid.rotation).y) * 180 / Math.PI - 90,
            speedForward,
            speedVertical: this.rigid.velocity.y,
            speedLR,
            speedAK,
            angular: [angular.yw, angular.xw, angular.zw, angular.xy, angular.yz, angular.xz]
        });
    }
}
class PIDCtrl {
    offset = 0;
    prev = NaN;
    p;
    i;
    d;
    constructor(p, i, d) {
        this.p = p;
        this.i = i;
        this.d = d;
    }
    step(error, dt) {
        const delta = isNaN(this.prev) ? 0 : error - this.prev;
        this.prev = error;
        this.offset += error;
        return this.p * error + this.i * this.offset * dt + this.d * delta / dt;
    }
}
class AircraftMecanism extends tesserxel.physics.Force {
    engine = 0;
    rigid;
    controls;
    constructor(ctrl) {
        super();
        this.controls = ctrl.controls;
        this.rigid = ctrl.rigid;
        // rigid.acceleration
    }
    localForce = new Vec4;
    localTorque = new Bivec;
    airTorque = new Bivec;
    coeffMotor = 1;
    coeffDamp = 0.15;
    constFriction = 0.0001;
    applyForce(force, position) {
        this.localForce.adds(force);
        this.localTorque.adds(position.wedge(force));
    }
    applyWorldForce(force, position) {
        this.rigid.force.adds(force);
        this.rigid.torque.adds(position.sub(this.rigid.position).wedge(force));
    }
    apply(time) {
        this.localForce.set();
        this.localTorque.set();
        const windVelocity = this.rigid.velocity.rotateconj(this.rigid.rotation);
        const ycenter = -0.816;
        this.applyForce(new Vec4(0, 0, 0, -this.controls.throttle * 33), new Vec4(0, ycenter));
        // wind force on wings
        // const wingPosW = 0.324;
        const wingPosW = 0.1;
        const tailHPosW = 2.75;
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron1 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron1) * (Math.sign(this.controls.aileron1) * 0.05 + 0.1))), new Vec4(2, ycenter, 0, wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron2 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron2) * (Math.sign(this.controls.aileron2) * 0.05 + 0.1))), new Vec4(-1, ycenter, Math.sqrt(3), wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3, -windVelocity.y * 0.5 - windVelocity.w * (0.4 + this.controls.aileron3 * 3) * 0.2, -windVelocity.z * 0.3, -windVelocity.w * (0.05 + Math.abs(this.controls.aileron3) * (Math.sign(this.controls.aileron3) * 0.05 + 0.1))), new Vec4(-1, ycenter, -Math.sqrt(3), wingPosW));
        this.applyForce(new Vec4(-windVelocity.x * 0.3 - windVelocity.w * 0.2 * this.controls.rudderX, -windVelocity.y * 0.5 - windVelocity.w * 0.09, -windVelocity.z * 0.3 - windVelocity.w * 0.2 * this.controls.rudderY, -windVelocity.w * 0.05).mulfs(0.4), new Vec4(0, ycenter, 0, tailHPosW));
        //flap
        this.applyForce(new Vec4(0, 0 - windVelocity.w * (0.2 + 0.2 * this.controls.flap), 0, -windVelocity.w * 0.5 * this.controls.flap).mulfs(0.4), new Vec4(0, ycenter, 0, wingPosW));
        // air friction torque
        this.localTorque.addmulfs(this.rigid.angularVelocity.clone().rotatesconj(this.rigid.rotation), -windVelocity.normsqr() * 0.001);
        // spin
        this.localTorque.addmulfs(Bivec.xz, -windVelocity.norm() * 0.1 * this.controls.spinnor);
        // brake on gear
        const wv = windVelocity.xzw().norm();
        if (wv > 0.05) {
            const gear0 = this.rigid.local2world(new Vec4(0, -1.6, 0, -0.6));
            const gear1 = this.rigid.local2world(new Vec4(1.4 * 2, -1.6, 0, 1));
            const gear2 = this.rigid.local2world(new Vec4(-0.7 * 2, -1.6, 0.7 * 2 * Math.sqrt(3), 1));
            const gear3 = this.rigid.local2world(new Vec4(-0.7 * 2, -1.6, -0.7 * 2 * Math.sqrt(3), 1));
            const lv0 = new Vec4();
            this.rigid.getlinearVelocity(lv0, gear0);
            lv0.y = 0;
            const lv1 = new Vec4();
            this.rigid.getlinearVelocity(lv1, gear1);
            lv1.y = 0;
            const lv2 = new Vec4();
            this.rigid.getlinearVelocity(lv2, gear2);
            lv2.y = 0;
            const lv3 = new Vec4();
            this.rigid.getlinearVelocity(lv3, gear3);
            lv3.y = 0;
            const rx = Vec4.x.rotate(this.rigid.rotation);
            rx.y = 0;
            rx.norms();
            const rz = Vec4.z.rotate(this.rigid.rotation);
            rz.y = 0;
            rz.norms();
            const rw = Vec4.w.rotate(this.rigid.rotation);
            rw.y = 0;
            rw.norms();
            const lv0mag = lv0.norm();
            const lv1mag = lv1.norm();
            const lv2mag = lv2.norm();
            const lv3mag = lv3.norm();
            if (gear0.y < 0.8) {
                const f = new Vec4(12 * lv0.dot(rx) / lv0mag, 0, 12 * lv0.dot(rz) / lv0mag, 0).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear0);
            }
            if (gear1.y < 0.8) {
                const f = new Vec4(12 * lv1.dot(rx) / lv1mag, 0, 12 * lv1.dot(rz) / lv1mag, this.controls.brake1 * 12 * lv1.dot(rw) / lv1mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear1);
            }
            if (gear2.y < 0.8) {
                const f = new Vec4(12 * lv2.dot(rx) / lv2mag, 0, 12 * lv2.dot(rz) / lv2mag, this.controls.brake2 * 12 * lv2.dot(rw) / lv2mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear2);
            }
            if (gear3.y < 0.8) {
                const f = new Vec4(12 * lv3.dot(rx) / lv3mag, 0, 12 * lv3.dot(rz) / lv3mag, this.controls.brake3 * 12 * lv3.dot(rw) / lv3mag).negs().rotates(this.rigid.rotation);
                f.y = 0;
                this.applyWorldForce(f, gear3);
            }
        }
        // total apply
        this.rigid.force.adds(this.localForce.rotates(this.rigid.rotation));
        this.rigid.torque.adds(this.localTorque.rotates(this.rigid.rotation));
    }
}
//# sourceMappingURL=aircraft.js.map
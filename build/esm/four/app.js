import { RetinaController, ControllerRegistry } from '../util/ctrl.js';
import { Renderer } from './renderer.js';
import { Scene, PerspectiveCamera } from './scene.js';

class App {
    canvas;
    renderer;
    scene;
    camera;
    controllerRegistry;
    retinaController;
    onresize;
    _onFrame;
    _running = false;
    _autoResize = false;
    _resizeHandler;
    enableAutoResize() {
        if (this._autoResize)
            return;
        this._autoResize = true;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this._resizeHandler = () => {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            if (this.onresize)
                this.onresize({ width, height });
            this.renderer.setSize({ width, height });
        };
        this._resizeHandler();
        window.addEventListener("resize", this._resizeHandler);
    }
    disableAutoResize() {
        if (!this._autoResize || !this._resizeHandler)
            return;
        window.removeEventListener("resize", this._resizeHandler);
        this._autoResize = false;
        this._resizeHandler = undefined;
    }
    constructor(canvas, renderer, scene, camera, controllerRegistry) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controllerRegistry = controllerRegistry;
    }
    static async create(opts) {
        const renderer = await new Renderer(opts.canvas, opts.renderConfig).init();
        const scene = opts.scene ?? new Scene();
        const camera = opts.camera ?? new PerspectiveCamera();
        scene.add(camera);
        const controls = opts.controls ?? [new RetinaController(renderer.core)];
        const controllerRegistry = new ControllerRegistry(opts.canvas, controls, opts.controllerConfig);
        const app = new App(opts.canvas, renderer, scene, camera, controllerRegistry);
        if (opts.autoSetSize !== false) {
            app.enableAutoResize();
        }
        if (!opts.controls)
            app.retinaController = controls[0];
        return app;
    }
    run(onFrame) {
        this._onFrame = onFrame;
        this._running = true;
        const frame = () => {
            if (!this._running)
                return;
            this.controllerRegistry.update();
            this._onFrame?.();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(frame);
        };
        frame();
    }
    stop() {
        this._running = false;
    }
}

export { App };
//# sourceMappingURL=app.js.map

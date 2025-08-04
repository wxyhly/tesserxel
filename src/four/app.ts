import { ControllerConfig, ControllerRegistry, IController, RetinaController } from "../util/ctrl";
import { Renderer, RendererConfig } from "./renderer";
import { Camera, PerspectiveCamera, Scene } from "./scene";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;
    camera: Camera;
    controllerRegistry: ControllerRegistry;
    retinaController?: RetinaController;
    onresize?: (e: { width: number, height: number }) => void;
    private _onFrame?: () => void;
    private _running: boolean = false;
    private _autoResize: boolean = false;
    private _resizeHandler?: () => void;

    enableAutoResize() {
        if (this._autoResize) return;
        this._autoResize = true;
        this._resizeHandler = () => {
            const width = window.innerWidth * window.devicePixelRatio;
            const height = window.innerHeight * window.devicePixelRatio;
            if (this.onresize) this.onresize({ width, height });
            this.renderer.setSize({ width, height });
        };
        this._resizeHandler();
        window.addEventListener("resize", this._resizeHandler);
    }
    disableAutoResize() {
        if (!this._autoResize || !this._resizeHandler) return;
        window.removeEventListener("resize", this._resizeHandler);
        this._autoResize = false;
        this._resizeHandler = undefined;
    }
    private constructor(
        canvas: HTMLCanvasElement,
        renderer: Renderer,
        scene: Scene,
        camera: Camera,
        controllerRegistry: ControllerRegistry
    ) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controllerRegistry = controllerRegistry;
    }

    static async create(opts: {
        canvas: HTMLCanvasElement;
        scene?: Scene;
        camera?: Camera;
        controls?: IController[];
        autoSetSize?: boolean;
        renderConfig?: RendererConfig;
        controllerConfig?: ControllerConfig;
    }): Promise<App> {
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
        if (!opts.controls) app.retinaController = controls[0] as RetinaController;
        return app;
    }
    run(onFrame?: () => void) {
        this._onFrame = onFrame;
        this._running = true;
        const frame = () => {
            if (!this._running) return;
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
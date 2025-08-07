import { ControllerConfig, ControllerRegistry, IController, RetinaController } from "../util/ctrl.js";
import { Renderer, RendererConfig } from "./renderer.js";
import { Camera, Scene } from "./scene.js";
export declare class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    scene: Scene;
    camera: Camera;
    controllerRegistry: ControllerRegistry;
    retinaController?: RetinaController;
    onresize?: (e: {
        width: number;
        height: number;
    }) => void;
    private _onFrame?;
    private _running;
    private _autoResize;
    private _resizeHandler?;
    enableAutoResize(): void;
    disableAutoResize(): void;
    private constructor();
    static create(opts: {
        canvas: HTMLCanvasElement;
        scene?: Scene;
        camera?: Camera;
        controls?: IController[];
        autoSetSize?: boolean;
        renderConfig?: RendererConfig;
        controllerConfig?: ControllerConfig;
    }): Promise<App>;
    run(onFrame?: () => void): void;
    stop(): void;
}

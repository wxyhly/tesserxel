export declare abstract class BaseWindow {
    protected overlay: HTMLDivElement;
    protected panel: HTMLDivElement;
    isOpen: boolean;
    constructor();
    open(): void;
    close(): void;
    abstract render(): void;
    private injectStyle;
}

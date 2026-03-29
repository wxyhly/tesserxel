export declare abstract class BaseWindow {
    protected overlay: HTMLDivElement;
    protected panel: HTMLDivElement;
    isOpen: boolean;
    constructor();
    open(): void;
    close(): void;
    /** 子类实现 */
    abstract render(): void;
    private injectStyle;
}

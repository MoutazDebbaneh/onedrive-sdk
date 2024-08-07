import { IAuthenticateCommand, IFilePickerOptions, INotificationData, IPickData } from "./types.js";
export * from "./types.js";
export declare type TokenFactory = (command: IAuthenticateCommand) => Promise<string>;
interface PickerChangeEvent extends Event {
    detail: IPickData;
}
interface PickerNotificationEvent extends Event {
    detail: INotificationData;
}
interface PickerWindowEventMap {
    "pickerchange": PickerChangeEvent;
    "pickernotifiation": PickerNotificationEvent;
}
declare type PickerWindow = {
    addEventListener<K extends keyof PickerWindowEventMap>(type: K, listener: (this: Window, ev: PickerWindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof PickerWindowEventMap>(type: K, listener: (this: Window, ev: PickerWindowEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
};
export interface BasePickerInit {
    tokenFactory: TokenFactory;
    options: IFilePickerOptions;
}
export interface OneDriveConsumerInit extends BasePickerInit {
    type: "Consumer";
}
export interface ODSPInit extends BasePickerInit {
    type: "ODSP";
    baseUrl: string;
}
/**
 * Initializes and loads a new file picker into the provided window using the supplied init
 *
 * @param win The window (ifram/pop-up) into which the file picker will be loaded
 * @param init The initialization used to create the file picker
 * @returns A picker window interface
 */
export declare function Picker(win: Window, init: OneDriveConsumerInit | ODSPInit): Promise<PickerWindow>;

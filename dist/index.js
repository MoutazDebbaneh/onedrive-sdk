import { combine } from "./utils.js";
export * from "./types.js";
/**
 * Initializes and loads a new file picker into the provided window using the supplied init
 *
 * @param win The window (ifram/pop-up) into which the file picker will be loaded
 * @param init The initialization used to create the file picker
 * @returns A picker window interface
 */
export async function Picker(win, init) {
    // this is the port we'll use to communicate with the picker
    let port;
    // we default to the consumer values since they are fixed
    const baseUrl = init.type === "ODSP" ? init.baseUrl : "https://onedrive.live.com";
    const pickerPath = combine(baseUrl, init.type === "ODSP" ? "_layouts/15/FilePicker.aspx" : "picker");
    // grab the things we need from the init
    const { tokenFactory, options } = init;
    // define the message listener to process the various messages from the window
    async function messageListener(message) {
        switch (message.data.type) {
            case "notification":
                window.dispatchEvent(new CustomEvent("pickernotifiation", {
                    detail: message.data
                }));
                break;
            case "command":
                port.postMessage({
                    type: "acknowledge",
                    id: message.data.id,
                });
                const command = message.data.data;
                switch (command.command) {
                    case "authenticate":
                        const token = await tokenFactory(command);
                        if (typeof token !== "undefined") {
                            port.postMessage({
                                type: "result",
                                id: message.data.id,
                                data: {
                                    result: "token",
                                    token,
                                },
                            });
                        }
                        break;
                    case "close":
                        win.close();
                        port.postMessage({
                            type: "result",
                            id: message.data.id,
                            data: {
                                result: "success",
                            },
                        });
                        break;
                    case "pick":
                        window.dispatchEvent(new CustomEvent("pickerchange", {
                            detail: message.data
                        }));
                        port.postMessage({
                            type: "result",
                            id: message.data.id,
                            data: {
                                result: "success",
                            },
                        });
                        break;
                    default:
                        console.warn(`Unsupported picker command: ${JSON.stringify(command)}`);
                        // let the picker know we don't support whatever command it sent
                        port.postMessage({
                            result: "error",
                            error: {
                                code: "unsupportedCommand",
                                message: command.command
                            },
                            isExpected: true,
                        });
                        break;
                }
                break;
        }
    }
    // attach a listener for the message event to setup our channel
    window.addEventListener("message", (event) => {
        if (event.source && event.source === win) {
            const message = event.data;
            if (message.type === "initialize" && message.channelId === options.messaging.channelId) {
                port = event.ports[0];
                port.addEventListener("message", messageListener);
                port.start();
                port.postMessage({
                    type: "activate",
                });
            }
        }
    });
    const authToken = await tokenFactory({
        command: "authenticate",
        type: "SharePoint",
        resource: baseUrl,
    });
    const queryString = new URLSearchParams({
        filePicker: JSON.stringify(options),
    });
    const url = `${pickerPath}?${queryString}`;
    // now we post a form into the window to load the picker with the options
    const form = win.document.createElement("form");
    form.setAttribute("action", url);
    form.setAttribute("method", "POST");
    win.document.body.append(form);
    if (authToken !== null) {
        const input = win.document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "access_token");
        input.setAttribute("value", authToken);
        form.appendChild(input);
    }
    // this will load the picker into the window
    form.submit();
    // we return the current global window, which will get sent the custom events
    // when there are notifications or items are picked, but we scoped down the typings
    // to make intendend options clearer
    return window;
}
//# sourceMappingURL=index.js.map
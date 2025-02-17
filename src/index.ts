import { geckoTerminalMonitor } from "./monitors/geckoTerminalMonitor";

export const main = async () => {
    await geckoTerminalMonitor();
};

main();

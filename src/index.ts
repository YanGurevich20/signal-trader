import { geckoTerminalMonitor } from "./monitors/geckoTerminalMonitor";

export const main = async () => {
  try {
    await geckoTerminalMonitor();
  } catch (error) {
    console.error("error in main", error);
    await main();
  }
};

main();

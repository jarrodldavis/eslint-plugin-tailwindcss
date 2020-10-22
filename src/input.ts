import { promises as fs } from "fs";
import path from "path";

// language=PostCSS
const DEFAULT_INPUT_STYLE_SHEET = `
  @tailwind base;
  @tailwind utilities;
  @tailwind components;
`;

export default async function readInput(styleSheetPath?: string): Promise<[string, string | undefined]> {
  if (styleSheetPath === "-") {
    if (process.stdin.isTTY) {
      throw new Error("Refusing to read from stdin because it is a TTY.");
    }

    let inputStyleSheet = "";
    for await (const chunk of process.stdin) {
      inputStyleSheet += chunk;
    }
    return [inputStyleSheet, undefined];
  } else if (styleSheetPath) {
    return [await fs.readFile(styleSheetPath, "utf-8"), path.resolve(styleSheetPath)];
  } else {
    return [DEFAULT_INPUT_STYLE_SHEET, undefined];
  }
}

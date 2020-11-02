import type { ExtractArgs } from "./extract-classes-bin";
import type { Options } from "./options";

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

function readStyles(cwd: string, stylesPath: string | null): [string, string | null] {
  // language=PostCSS
  const DEFAULT_INPUT_STYLE_SHEET = `
    @tailwind base;
    @tailwind utilities;
    @tailwind components;
  `;

  if (stylesPath) {
    const fullStylesPath = path.resolve(cwd, stylesPath);
    return [fs.readFileSync(fullStylesPath, "utf-8"), fullStylesPath];
  } else {
    return [DEFAULT_INPUT_STYLE_SHEET, null];
  }
}

function extractClasses(args: ExtractArgs): string[] {
  const rawClasses = execFileSync(process.argv[0], [path.join(__dirname, "./extract-classes-bin.js")], {
    encoding: "utf-8",
    input: JSON.stringify(args),
  });

  const parsedClasses = JSON.parse(rawClasses) as unknown;
  if (Array.isArray(parsedClasses)) {
    return parsedClasses as string[];
  } else {
    throw new Error("Expected array result from class extraction.");
  }
}

let cachedStylesHash = "";
let cachedClassesValue = new Set<string>();

export default function getClasses(options: Options, cwd: string): Set<string> {
  const [styles, stylesPath] = readStyles(cwd, options.stylesheet);

  const stylesHash = createHash("sha1").update(styles).digest("hex");

  if (stylesHash !== cachedStylesHash) {
    const classes = extractClasses({ cwd, styles, stylesPath, config: options.config });
    cachedStylesHash = stylesHash;
    cachedClassesValue = new Set(classes);
  }

  return cachedClassesValue;
}

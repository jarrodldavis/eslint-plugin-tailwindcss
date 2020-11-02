import type { ExtractArgs } from "./extract-classes-bin";
import type { Options } from "./options";

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_INPUT_STYLE_SHEET = `
  @tailwind base;
  @tailwind utilities;
  @tailwind components;
`;

const DEFAULT_INPUT_CHANGED = new Date();

function readStyles(cwd: string, stylesPath: string | null): [string, string | null, Date] {
  if (stylesPath) {
    const fullStylesPath = path.resolve(cwd, stylesPath);
    const { mtime } = fs.statSync(fullStylesPath);
    return [fs.readFileSync(fullStylesPath, "utf-8"), fullStylesPath, mtime];
  } else {
    return [DEFAULT_INPUT_STYLE_SHEET, null, DEFAULT_INPUT_CHANGED];
  }
}

function extractClasses(args: ExtractArgs): string[] {
  const rawClasses = execFileSync(process.argv[0], [path.join(__dirname, "./extract-classes-bin.js")], {
    encoding: "utf-8",
    input: JSON.stringify(args),
    stdio: "pipe",
  });

  const parsedClasses = JSON.parse(rawClasses) as unknown;
  if (Array.isArray(parsedClasses)) {
    return parsedClasses as string[];
  } else {
    throw new Error("Expected array result from class extraction.");
  }
}

let cachedStylesHash = "";
let cachedStylesChanged: Date = new Date();
let cachedClassesValue = new Set<string>();

export default function getClasses(options: Options, cwd: string): Set<string> {
  const [styles, stylesPath, stylesChanged] = readStyles(cwd, options.stylesheet);

  const stylesHash = createHash("sha1").update(styles).digest("hex");

  if (stylesHash !== cachedStylesHash || stylesChanged.valueOf() !== cachedStylesChanged.valueOf()) {
    const classes = extractClasses({ cwd, styles, stylesPath, config: options.config });
    cachedStylesHash = stylesHash;
    cachedStylesChanged = stylesChanged;
    cachedClassesValue = new Set(classes);
  }

  return cachedClassesValue;
}

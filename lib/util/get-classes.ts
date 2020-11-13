import type { ExtractArgs } from "./extract-classes-bin";
import type { Options } from "./options";

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_INPUT_STYLE_SHEET = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
`;

const DEFAULT_INPUT_CHANGED = new Date();

// The kitchen sink test (all variants for all utilities, plus official plugins)
// results in an `extract-classes-bin` stdout buffer of about 24 megabytes
const ONE_MEGABYTE = 1024 * 1024;
const EXTRACT_CLASSES_BUFFER_SIZE = 25 * ONE_MEGABYTE;

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
    maxBuffer: EXTRACT_CLASSES_BUFFER_SIZE,
  });

  const parsedClasses = JSON.parse(rawClasses) as unknown;
  if (Array.isArray(parsedClasses)) {
    return parsedClasses as string[];
  } else {
    throw new Error("Expected array result from class extraction.");
  }
}

let cachedOptionsHash = "";
let cachedStylesHash = "";
let cachedStylesChanged: Date = new Date();
let cachedClassesValue = new Set<string>();

export default function getClasses(options: Options, cwd: string): Set<string> {
  const [styles, stylesPath, stylesChanged] = readStyles(cwd, options.stylesheet);

  const optionsHash = createHash("sha1").update(JSON.stringify(options)).digest("hex");
  const stylesHash = createHash("sha1").update(styles).digest("hex");

  if (
    optionsHash !== cachedOptionsHash ||
    stylesHash !== cachedStylesHash ||
    stylesChanged.valueOf() !== cachedStylesChanged.valueOf()
  ) {
    const classes = extractClasses({ cwd, styles, stylesPath, config: options.config });
    cachedOptionsHash = optionsHash;
    cachedStylesHash = stylesHash;
    cachedStylesChanged = stylesChanged;
    cachedClassesValue = new Set(classes);
  }

  return cachedClassesValue;
}

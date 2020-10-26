import { basename } from "path";

import sade from "sade";
import { error } from "sade/lib/utils";

interface PackageMetadata {
  name: string;
  version: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version, description } = require("../package.json") as PackageMetadata;

const bin = process.argv[1] ? basename(process.argv[1]) : name;

export interface Options {
  styleSheetPath?: string;
  configPath?: string;
  outputPath?: string;
}

export default function run(handler: (opts: Options) => Promise<void>): void {
  const cli = sade(bin)
    .version(version)
    .describe(description)
    .command("generate")
    .describe("Generate a TypeScript source module")
    .alias("gen")
    .option("-i, --input-path", "Specifies the Tailwind input stylesheet path")
    .option("-c, --config-path", "Specifies the the Tailwind configuration file path")
    .option("-o, --output-path", "Specifies the generated TypeScript module output path")
    .example("generate > tw-classes.ts")
    .example("generate -i=- -o=- > tw-classes.ts")
    .example("generate -o tw-classes.ts")
    .example("generate -i styles.css -o tw-classes.ts")
    .example("generate -c configs/tailwind.js -o tw-classes.ts")
    .example("generate -i styles.css -c configs/tailwind.js -o tw-classes.ts")
    .action((opts: ParsedOptions) => action(opts, handler));

  const result: unknown = cli.parse(process.argv, { unknown: (flag) => `Unknown option: ${flag}` });

  if (typeof result === "string") {
    error(bin, result);
  }
}

interface ParsedOptions {
  _: string[];
  "input-path"?: unknown;
  "config-path"?: unknown;
  "output-path"?: unknown;
}

function action(opts: ParsedOptions, handler: (opts: Options) => Promise<void>): string | void {
  const { _: extraArguments, "input-path": input, "config-path": config, "output-path": output } = opts;

  if (extraArguments.length > 0) {
    return "Unexpected arguments: " + extraArguments.join(" ");
  } else if (input === true) {
    return "`--input-path` option requires an argument";
  } else if (input !== undefined && typeof input !== "string") {
    return "Invalid `--input-path` value: " + (input as string);
  } else if (config === true) {
    return "`--config-path` option requires an argument";
  } else if (config !== undefined && typeof config !== "string") {
    return "Invalid `--config-path` value: " + (config as string);
  } else if (output === true) {
    return "`--output-path` option requires an argument";
  } else if (output !== undefined && typeof output !== "string") {
    return "Invalid `--output-path` value: " + (output as string);
  }

  handler({ styleSheetPath: input, configPath: config, outputPath: output }).catch(console.error);
}

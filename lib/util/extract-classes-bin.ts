import type { Root, Transformer } from "postcss";

import path from "path";

import postcss from "postcss";
import postcssrc from "postcss-load-config";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

export interface ExtractArgs {
  cwd: string;
  styles: string;
  stylesPath: string | null;
  config: { postcss: true } | { tailwind: string | null };
}

export default async function extractClasses(args: ExtractArgs): Promise<Iterable<string>> {
  const { cwd, styles, stylesPath, config } = args;

  const classes = new Set<string>();

  const classExtractor = createSelectorParser((selectors) =>
    selectors.walkClasses((node) => {
      classes.add(node.value);
    })
  );

  const transformer: Transformer = (root: Root): void => {
    root.walkRules((rule) => {
      classExtractor.processSync(rule.selector);
    });
  };

  const from = stylesPath ? path.resolve(cwd, stylesPath) : undefined;

  if ("tailwind" in config) {
    const configPath = config.tailwind ? path.resolve(cwd, config.tailwind) : undefined;
    await postcss(tailwindcss(configPath), transformer).process(styles, { from });
  } else {
    const { options, plugins } = await postcssrc({ cwd, from }, cwd);
    await postcss([...plugins, transformer]).process(styles, { from, ...options });
  }

  return classes;
}

async function getArgs(): Promise<ExtractArgs> {
  if (process.stdin.isTTY) {
    throw new Error("Unexpected TTY");
  }

  let rawArgs = "";
  for await (const chunk of process.stdin) {
    rawArgs += chunk;
  }

  const parsedArgs = JSON.parse(rawArgs) as unknown;

  if (typeof parsedArgs !== "object" || !parsedArgs) {
    throw new Error("Expected object");
  }

  if (!("styles" in parsedArgs) || !("stylesPath" in parsedArgs)) {
    throw new Error("Missing styles or stylesPath");
  }

  return parsedArgs as ExtractArgs;
}

getArgs()
  .then(extractClasses)
  .then((classes) => process.stdout.write(JSON.stringify(Array.from(classes))))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

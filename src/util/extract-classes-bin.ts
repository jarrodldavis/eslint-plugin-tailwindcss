import postcss, { Root, Transformer } from "postcss";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

export interface ExtractArgs {
  styles: string;
  stylesPath: string | null;
  configPath: string | null;
}

export default async function extractClasses(args: ExtractArgs): Promise<Iterable<string>> {
  const { styles, stylesPath, configPath } = args;

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

  const config = configPath ?? undefined;
  const from = stylesPath ?? undefined;
  await postcss(tailwindcss(config), transformer).process(styles, { from });

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

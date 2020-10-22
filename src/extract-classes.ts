import postcss, { Root, Transformer } from "postcss";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

interface ExtractArgs {
  inputStyleSheet: string;
  inputStyleSheetPath: string | undefined;
  configPath?: string;
}

export default async function extractClasses(args: ExtractArgs): Promise<Iterable<string>> {
  const { inputStyleSheet, inputStyleSheetPath, configPath } = args;

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

  await postcss(tailwindcss(configPath), transformer).process(inputStyleSheet, { from: inputStyleSheetPath });

  return classes;
}

console.log("Hello, world!");

import postcss, { Root, Transformer } from "postcss";
import createSelectorParser from "postcss-selector-parser";
import tailwindcss from "tailwindcss";

async function extractClasses(): Promise<Set<string>> {
  const classes = new Set<string>();

  const transformer: Transformer = (root: Root): void => {
    const classExtractor = createSelectorParser((selectors) =>
      selectors.walkClasses((node) => {
        classes.add(node.value);
      })
    );

    root.walkRules((rule) => {
      classExtractor.processSync(rule.selector);
    });
  };

  const css = "@tailwind base; @tailwind utilities; @tailwind components;";

  await postcss(tailwindcss, transformer).process(css, { from: undefined });

  return classes;
}

extractClasses().then(console.log, console.error);

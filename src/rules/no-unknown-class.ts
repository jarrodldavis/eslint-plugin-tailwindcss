import type { Rule } from "eslint";
import type { Node } from "estree-jsx";
import type { ClassNameMatch } from "../util/types";

import { schema, getOptions } from "../util/options";
import getClasses from "../util/get-classes";
import parseClassName from "../util/parse-class-name";

type Metadata = Rule.RuleModule["meta"];
type Create = Rule.RuleModule["create"];

export const meta: Metadata = {
  type: "problem",
  docs: {
    description: "disallow unknown Tailwind utility or component classes",
    category: "Possible Errors",
    recommended: true,
  },
  messages: {
    unknown: "Unknown Tailwind utility or component class '{{name}}'.",
  },
  schema,
};

export const create: Create = function create(context) {
  const options = getOptions(context.options);
  const classes = getClasses(options);

  console.log(options, classes);

  const source = context.getSourceCode();

  function validateClasses(matches: ClassNameMatch[]): void {
    for (const match of matches) {
      if (!classes.has(match.value)) {
        const start = source.getLocFromIndex(match.range[0]);
        const end = source.getLocFromIndex(match.range[1]);
        context.report({ messageId: "unknown", data: { name: match.value }, loc: { start, end } });
      }
    }
  }

  return {
    "JSXAttribute[name.name='className'] > Literal"(node: Node) {
      if (node.type !== "Literal") {
        throw new Error("Unexpected non-literal node.");
      }

      if (typeof node.value !== "string") {
        return;
      }

      validateClasses(parseClassName(source, node));
    },
  };

  return {};
};

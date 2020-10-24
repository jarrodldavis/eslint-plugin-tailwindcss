import type { Rule } from "eslint";

import { schema, getOptions } from "../util/options";
import getClasses from "../util/get-classes";

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

  return {};
};

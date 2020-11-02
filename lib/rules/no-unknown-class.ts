import type { Rule } from "eslint";
import type { Node } from "estree-jsx";

import { schema, getOptions } from "../util/options";
import getClasses from "../util/get-classes";
import ReportDescriptorBuilder, { MESSAGES } from "../util/reporter";
import AttributeValidator from "../util/attribute-validator";
import ArgumentValidator from "../util/argument-validator";

type Metadata = Rule.RuleModule["meta"];
type Create = Rule.RuleModule["create"];

export const meta: Metadata = {
  type: "problem",
  docs: {
    description: "disallow unknown Tailwind utility or component classes",
    category: "Possible Errors",
    recommended: true,
    url: "https://github.com/jarrodldavis/eslint-plugin-tailwindcss/blob/main/docs/rules/no-unknown-class.md",
  },
  messages: MESSAGES,
  schema,
};

export const create: Create = function create(context) {
  const options = getOptions(context.options);
  const classes = getClasses(options, context.getCwd());

  const reporter = new ReportDescriptorBuilder(context);

  function attribute(node: Node) {
    new AttributeValidator(context, options, reporter, classes).validateAttribute(node);
  }

  function call(node: Node) {
    new ArgumentValidator(context, options, reporter, classes).validateCallExpression(node);
  }

  const attributeListeners = options.classNameAttributes
    .map((name) => `JSXAttribute[name.name=${JSON.stringify(name)}]`)
    .reduce((listeners, selector) => ({ ...listeners, [selector]: attribute }), {});

  const callListeners = options.classNameBuilders
    .map((name) => `CallExpression[callee.name=${JSON.stringify(name)}]`)
    .reduce((listeners, selector) => ({ ...listeners, [selector]: call }), {});

  return { ...attributeListeners, ...callListeners };
};

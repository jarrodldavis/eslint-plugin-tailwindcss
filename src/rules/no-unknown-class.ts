import type { Rule, Scope } from "eslint";
import type { Node, Identifier } from "estree-jsx";
import type { ClassNameMatch } from "../util/types";

import { schema, getOptions } from "../util/options";
import getClasses from "../util/get-classes";
import parseClassName from "../util/parse-class-name";
import findIdentifier from "../util/find-identifier";
import findVariable from "../util/find-variable";
import getAttributeName from "../util/get-attribute-name";

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
    unknownInLiteral: "Unknown Tailwind utility or component class '{{name}}'.",
    unknownInValue: "Unknown Tailwind utility or component class in value.",
    dynamicSource: "Unexpected source of dynamic '{{attribute}}' value.",
    dynamicTarget: "Unexpected dynamic '{{attribute}}' value.",
  },
  schema,
};

export const create: Create = function create(context) {
  const options = getOptions(context.options);
  const classes = getClasses(options);

  const source = context.getSourceCode();

  function reportDynamicGlobal(node: Identifier, variable: Scope.Variable): void {
    const attribute = getAttributeName(context.getAncestors.bind(context));
    context.report({ messageId: "dynamicTarget", data: { attribute }, node });

    if (variable.eslintExplicitGlobalComments) {
      for (const comment of variable.eslintExplicitGlobalComments) {
        context.report({ messageId: "dynamicSource", data: { attribute }, node: comment });
      }
    }
  }

  function reportDynamicDefinition(node: Identifier, variable: Scope.Variable, definition: Scope.Definition): void {
    const attribute = getAttributeName(context.getAncestors.bind(context));
    const source = findIdentifier(definition.name, variable.name);
    context.report({ messageId: "dynamicTarget", data: { attribute }, node });
    context.report({ messageId: "dynamicSource", data: { attribute }, node: source });
  }

  function reportUnknownClasses(matches: ClassNameMatch[]): number {
    let invalid = 0;

    for (const match of matches) {
      if (!classes.has(match.value)) {
        const start = source.getLocFromIndex(match.range[0]);
        const end = source.getLocFromIndex(match.range[1]);
        context.report({ messageId: "unknownInLiteral", data: { name: match.value }, loc: { start, end } });
        invalid += 1;
      }
    }

    return invalid;
  }

  const validators = {
    literal(node: Node) {
      if (node.type !== "Literal") {
        throw new Error("Unexpected non-literal node.");
      }

      if (typeof node.value !== "string") {
        return;
      }

      reportUnknownClasses(parseClassName(source, node));
    },
    identifier(node: Node) {
      if (node.type !== "Identifier") {
        throw new Error("Unexpected non-Identifier node.");
      }

      const variable = findVariable(context.getScope(), node.name);

      if (!variable) {
        // unresolved variable reference; other ESLint rules should take care of it
        return;
      }

      if (variable.defs.length === 0) {
        reportDynamicGlobal(node, variable);
        return;
      } else if (variable.defs.length !== 1) {
        throw new Error("Expected a single variable definition.");
      }

      const definition = variable.defs[0];

      if (definition.type !== "Variable" || definition.node.init?.type !== "Literal") {
        reportDynamicDefinition(node, variable, definition);
        return;
      }

      if (typeof definition.node.init.value !== "string") {
        return;
      }

      const invalidCount = reportUnknownClasses(parseClassName(source, definition.node.init));
      if (invalidCount > 0) {
        context.report({ messageId: "unknownInValue", node });
      }
    },
  };

  /* eslint-disable @typescript-eslint/unbound-method */

  const literalListeners = options.classNameAttributes
    .map((name) => `JSXAttribute[name.name=${JSON.stringify(name)}] Literal`)
    .reduce((listeners, selector) => ({ ...listeners, [selector]: validators.literal }), {});

  const identifierListeners = options.classNameAttributes
    .map((name) => `JSXAttribute[name.name=${JSON.stringify(name)}] JSXExpressionContainer > Identifier`)
    .reduce((listeners, selector) => ({ ...listeners, [selector]: validators.identifier }), {});

  /* eslint-enable @typescript-eslint/unbound-method */

  return { ...literalListeners, ...identifierListeners };
};

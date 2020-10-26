import type { Rule, Scope, SourceCode } from "eslint";
import type { Node as VanillaNode } from "estree";
import type { Node, Identifier, JSXAttribute, SimpleCallExpression } from "estree-jsx";

import esquery from "esquery";
import { ClassNameMatch } from "./types";

type CurrentNode = null | JSXAttribute | SimpleCallExpression;

const unknownInLiteral = "unknownInLiteral";
const unknownInValue = "unknownInValue";
const dynamicSourceArgument = "dynamicSourceArgument";
const dynamicSourceValue = "dynamicSourceValue";
const dynamicTargetArgument = "dynamicTargetArgument";
const dynamicTargetValue = "dynamicTargetValue";

export const MESSAGES = {
  [unknownInLiteral]: "Unknown Tailwind utility or component class '{{name}}'.",
  [unknownInValue]: "Unknown Tailwind utility or component class in value.",
  [dynamicSourceArgument]: "Unexpected source of dynamic '{{name}}' argument.",
  [dynamicSourceValue]: "Unexpected source of dynamic '{{name}}' value.",
  [dynamicTargetArgument]: "Unexpected dynamic '{{name}}' argument.",
  [dynamicTargetValue]: "Unexpected dynamic '{{name}}' value.",
};

function findIdentifier(node: VanillaNode, name: string): Identifier {
  const nodes = esquery(node, `Identifier[name=${JSON.stringify(name)}]`);
  if (nodes.length === 0) {
    throw new Error("Could not find dynamic class name source identifier.");
  } else if (nodes[0].type !== "Identifier") {
    throw new Error("Expected dynamic class name source to be an identifier.");
  } else {
    return nodes[0];
  }
}

export default class Reporter {
  private report: (descriptor: Rule.ReportDescriptor) => void;
  private source: SourceCode;

  private currentNode: CurrentNode = null;

  public constructor(context: Rule.RuleContext) {
    this.report = context.report.bind(context);
    this.source = context.getSourceCode();
  }

  public setCurrent(node: CurrentNode): void {
    this.currentNode = node;
  }

  private getReportDescription(dynamic: "source" | "target", reportNode: Node): Rule.ReportDescriptor {
    let name: string;
    let messageId: string;

    if (this.currentNode === null) {
      throw new Error("Unexpected null current node.");
    } else if (this.currentNode.type === "CallExpression") {
      messageId = dynamic === "source" ? dynamicSourceArgument : dynamicTargetArgument;

      if (this.currentNode.callee.type !== "Identifier") {
        throw new Error();
      } else {
        name = this.currentNode.callee.name;
      }
    } else {
      messageId = dynamic === "source" ? dynamicSourceValue : dynamicTargetValue;

      if (this.currentNode.name.type === "JSXIdentifier") {
        name = this.currentNode.name.name;
      } else if (this.currentNode.name.type === "JSXNamespacedName") {
        name = `${this.currentNode.name.namespace.name}:${this.currentNode.name.name.name}`;
      } else {
        throw new Error("Unexpected node type for attribute name");
      }
    }

    return { messageId, data: { name }, node: reportNode };
  }

  public reportDynamicExpression(node: Node): void {
    this.report(this.getReportDescription("target", node));
  }

  public reportDynamicGlobal(node: Identifier, variable: Scope.Variable): void {
    this.report(this.getReportDescription("target", node));

    if (variable.eslintExplicitGlobalComments) {
      for (const comment of variable.eslintExplicitGlobalComments) {
        this.report(this.getReportDescription("source", comment));
      }
    }
  }

  public reportDynamicDefinition(node: Identifier, variable: Scope.Variable, definition: Scope.Definition): void {
    const source = definition.type === "Variable" ? definition.node : findIdentifier(definition.name, variable.name);
    this.report(this.getReportDescription("target", node));
    this.report(this.getReportDescription("source", source));
  }

  public reportUnknownClassName(match: ClassNameMatch): void;
  public reportUnknownClassName(info: { node: Node; name: string }): void;
  public reportUnknownClassName(match: ClassNameMatch | { node: Node; name: string }): void {
    if ("node" in match) {
      this.report({ messageId: unknownInLiteral, data: { name: match.name }, node: match.node });
    } else {
      const start = this.source.getLocFromIndex(match.range[0]);
      const end = this.source.getLocFromIndex(match.range[1]);
      this.report({ messageId: unknownInLiteral, data: { name: match.value }, loc: { start, end } });
    }
  }

  public reportUsageOfUnknownClassNameValue(node: Node): void {
    this.report({ messageId: unknownInValue, node });
  }
}

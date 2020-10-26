import type { Rule, Scope, SourceCode } from "eslint";
import type { Node } from "estree-jsx";
import type { Options } from "./options";
import type { ClassNameMatch } from "./types";

import Reporter from "./reporter";
import parseClassName from "./parse-class-name";

function findVariable(currentScope: Scope.Scope, name: string): Scope.Variable | undefined {
  let scope: Scope.Scope | null = currentScope;
  let variable: Scope.Variable | undefined;

  while (scope && !variable) {
    variable = scope.set.get(name);
    scope = scope.upper;
  }

  return variable;
}

export default abstract class Validator {
  private scope: Scope.Scope;
  private source: SourceCode;

  public constructor(
    context: Rule.RuleContext,
    private options: Options,
    protected reporter: Reporter,
    protected classes: Set<string>
  ) {
    this.scope = context.getScope();
    this.source = context.getSourceCode();
  }

  protected isClassNameBuilder(node: Node): boolean {
    return (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      this.options.classNameBuilders.includes(node.callee.name)
    );
  }

  private validateClasses(matches: ClassNameMatch[]): boolean {
    let valid = true;

    for (const match of matches) {
      if (!this.classes.has(match.value)) {
        this.reporter.reportUnknownClassName(match);
        valid = false;
      }
    }

    return valid;
  }

  protected validateLiteral(node: Node): boolean {
    if (node.type !== "Literal") {
      throw new Error("Unexpected non-literal node.");
    }

    if (typeof node.value !== "string") {
      return false;
    }

    return this.validateClasses(parseClassName(this.source, node));
  }

  protected validateIdentifier(node: Node, expressionValidator: (node: Node) => boolean): boolean {
    if (node.type !== "Identifier") {
      throw new Error("Unexpected non-Identifier node.");
    }

    const variable = findVariable(this.scope, node.name);

    if (!variable) {
      // unresolved variable reference; other ESLint rules should take care of it
      return false;
    }

    if (variable.defs.length === 0) {
      this.reporter.reportDynamicGlobal(node, variable);
      return false;
    } else if (variable.defs.length !== 1) {
      throw new Error("Expected a single variable definition.");
    }

    const definition = variable.defs[0];

    if (definition.type !== "Variable" || !definition.node.init) {
      this.reporter.reportDynamicDefinition(node, variable, definition);
      return false;
    }

    const init = definition.node.init;
    const isValid = expressionValidator(init);
    if (!isValid) {
      this.reporter.reportUsageOfUnknownClassNameValue(node);
    }
    return isValid;
  }
}

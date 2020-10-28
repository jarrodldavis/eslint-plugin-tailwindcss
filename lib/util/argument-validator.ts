import type { Node } from "estree-jsx";

import Validator from "./validator";

export default class ArgumentValidator extends Validator {
  private validateObjectProperty(node: Node): boolean {
    if (node.type !== "Property") {
      throw new Error("Unexpected non-property node.");
    }

    const key = node.key;

    if (!node.computed) {
      switch (key.type) {
        case "Literal":
          return this.validateLiteral(key);
        case "Identifier":
          if (!this.classes.has(key.name)) {
            this.reporter.reportUnknownClassName({ node: key, name: key.name });
            return false;
          } else {
            return true;
          }
        default:
          throw new Error("Unexpected key node for non-computed property in object expression.");
      }
    } else if (key.type === "Literal") {
      return this.validateLiteral(key);
    } else if (key.type === "Identifier") {
      return this.validateIdentifier(key, this.validateArgument.bind(this));
    } else {
      this.reporter.reportDynamicExpression(key);
      return false;
    }
  }

  private validateArgument(node: Node): boolean {
    switch (node.type) {
      case "Literal":
        return this.validateLiteral(node);
      case "Identifier":
        return this.validateIdentifier(node, this.validateArgument.bind(this));
      case "LogicalExpression":
        return this.validateArgument(node.right);
      case "ConditionalExpression": {
        const leftValid = this.validateArgument(node.consequent);
        const rightValid = this.validateArgument(node.alternate);
        return leftValid && rightValid;
      }
      case "ArrayExpression":
        return node.elements
          .map((element) => (element.type === "SpreadElement" ? element.argument : element))
          .map((element) => this.validateArgument(element))
          .reduce((allValid, elementValid) => allValid && elementValid);
      case "ObjectExpression":
        return node.properties
          .map((property) => this.validateArgument(property))
          .reduce((allValid, propertyValid) => allValid && propertyValid);
      case "Property":
        return this.validateObjectProperty(node);
      default:
        if (!this.isClassNameBuilder(node)) {
          this.reporter.reportDynamicExpression(node);
          return false;
        } else {
          return true;
        }
    }
  }

  public validateCallExpression(node: Node): boolean {
    if (node.type !== "CallExpression") {
      throw new Error("Unexpected non-call-expression node.");
    }

    if (node.callee.type !== "Identifier") {
      throw new Error("Unexpected non-identifier callee node");
    }

    this.reporter.setCurrent(node);

    const allValid = node.arguments
      .map((argument) => this.validateArgument(argument))
      .reduce((allValid, argumentValid) => allValid && argumentValid);

    this.reporter.setCurrent(null);

    return allValid;
  }
}

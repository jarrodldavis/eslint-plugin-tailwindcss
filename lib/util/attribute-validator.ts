import type { Node } from "estree-jsx";

import Validator from "./validator";

export default class AttributeValidator extends Validator {
  validateAttribute(node: Node): boolean {
    if (node.type !== "JSXAttribute") {
      throw new Error("Unexpected non-attribute node.");
    }

    this.reporter.setCurrent(node);

    if (!node.value) {
      return true;
    } else if (node.value.type === "Literal") {
      return this.validateLiteral(node.value);
    } else if (node.value.type !== "JSXExpressionContainer") {
      this.reporter.reportDynamicExpression(node.value);
      return false;
    }

    const isValid = this.validateAttributeValue(node.value.expression);
    this.reporter.setCurrent(null);
    return isValid;
  }

  private validateAttributeValue(node: Node): boolean {
    switch (node.type) {
      case "Literal":
        return this.validateLiteral(node);
      case "Identifier":
        return this.validateIdentifier(node, this.validateAttributeValue.bind(this));
      case "LogicalExpression":
        return this.validateAttributeValue(node.right);
      case "ConditionalExpression": {
        const leftValid = this.validateAttributeValue(node.consequent);
        const rightValid = this.validateAttributeValue(node.alternate);
        return leftValid && rightValid;
      }
      default:
        if (!this.isClassNameBuilder(node)) {
          this.reporter.reportDynamicExpression(node);
          return false;
        } else {
          return true;
        }
    }
  }
}

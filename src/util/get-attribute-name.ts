import type { Node, JSXAttribute } from "estree-jsx";

export default function getAttributeName(ancestors: () => Node[]): string {
  const attributeNode = ancestors()
    .reverse()
    .find((node: Node) => node.type === "JSXAttribute") as JSXAttribute;

  if (!attributeNode) {
    throw new Error("Could not find attribute parent for expression-contained identifier node");
  }

  const nameNode = attributeNode.name;
  if (nameNode.type === "JSXIdentifier") {
    return nameNode.name;
  } else if (nameNode.type === "JSXNamespacedName") {
    return `${nameNode.namespace.name}:${nameNode.name.name}`;
  } else {
    throw new Error("Unexpected node type for attribute name");
  }
}

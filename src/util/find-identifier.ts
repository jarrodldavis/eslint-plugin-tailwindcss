import type { Node as VanillaNode, Identifier } from "estree";

import esquery from "esquery";

export default function findIdentifier(node: VanillaNode, name: string): Identifier {
  const nodes = esquery(node, `Identifier[name="${name}"]`);
  if (nodes.length === 0) {
    throw new Error("Could not find dynamic class name source identifier.");
  } else if (nodes[0].type !== "Identifier") {
    throw new Error("Expected dynamic class name source to be an identifier.");
  } else {
    return nodes[0];
  }
}

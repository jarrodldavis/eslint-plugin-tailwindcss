import type { Scope } from "eslint";

export default function findVariable(currentScope: Scope.Scope, name: string): Scope.Variable | undefined {
  let scope: Scope.Scope | null = currentScope;
  let variable: Scope.Variable | undefined;

  while (scope && !variable) {
    variable = scope.set.get(name);
    scope = scope.upper;
  }

  return variable;
}

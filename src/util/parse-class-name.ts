import type { Literal } from "estree-jsx";
import type { ClassNameMatch } from "./types";

import { SourceCode } from "eslint";

function getRange(start: number, subIndex: number, subLength: number): [number, number] {
  return [start + subIndex, start + subIndex + subLength];
}

export default function parseClassName(source: SourceCode, literal: Literal): ClassNameMatch[] {
  if (literal.raw === undefined) {
    throw new Error("Literal node has no raw text information.");
  }

  if (typeof literal.value !== "string") {
    throw new Error("Unexpected non-string Literal node.");
  }

  let rawRange: [number, number];
  if (literal.range) {
    rawRange = literal.range;
  } else if (literal.loc) {
    const start = source.getIndexFromLoc(literal.loc.start);
    const end = source.getIndexFromLoc(literal.loc.end);
    rawRange = [start, end];
  } else {
    throw new Error("Literal node has no position information.");
  }

  const valueRange = getRange(rawRange[0], literal.raw.indexOf(literal.value), literal.value.length);

  function mapMatch(match: RegExpMatchArray): ClassNameMatch {
    if (match.index === undefined) {
      throw new Error("Matched class name value has no start index.");
    }

    const value = match[0];
    return { value, range: getRange(valueRange[0], match.index, value.length) };
  }

  return Array.from(literal.value.matchAll(/([^\s]+)/g)).map(mapMatch);
}

import type { SourceCode } from "eslint";
import type { Literal } from "estree-jsx";
import type { ClassNameMatch } from "./types";

import createMapping from "./raw-string-mapping";

export default function parseClassName(source: SourceCode, literal: Literal): ClassNameMatch[] {
  if (literal.raw === undefined) {
    throw new Error("Literal node has no raw text information.");
  }

  if (typeof literal.value !== "string") {
    throw new Error("Unexpected non-string Literal node.");
  }

  let start: number;
  if (literal.range) {
    start = literal.range[0];
  } else if (literal.loc) {
    start = source.getIndexFromLoc(literal.loc.start);
  } else {
    throw new Error("Literal node has no position information.");
  }

  const raw = literal.raw;

  const indexMapping = createMapping(raw, literal.value);

  function mapMatch(match: RegExpMatchArray): ClassNameMatch {
    const index = match.index;

    if (index === undefined) {
      throw new Error("Matched class name value has no start index.");
    }

    const matchValue = match[0];

    const valueStart = indexMapping[index];
    const valueEnd = indexMapping[index + matchValue.length - 1];

    const { value } = literal;
    const details = JSON.stringify({ raw, value, matchValue, match, index, indexMapping, valueStart, valueEnd });

    if (valueStart === undefined) {
      throw new Error("Could not map from value start index to raw start index: " + details);
    } else if (valueStart.character !== matchValue[0]) {
      throw new Error("Unexpected mismatch of matched class name value and raw start mapping entry: " + details);
    } else if (valueEnd === undefined) {
      throw new Error("Could not map from value end index to raw end index: " + details);
    } else if (valueEnd.character !== matchValue[matchValue.length - 1]) {
      throw new Error("Unexpected mismatch of matched class name value and raw end mapping entry: " + details);
    }

    const range: [number, number] = [
      start + valueStart.index,
      // range end values are after the last character
      start + valueEnd.index + 1,
    ];

    return { value: matchValue, range };
  }

  return Array.from(literal.value.matchAll(/([^\s]+)/g)).map(mapMatch);
}

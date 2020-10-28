/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Escape_notation
 *
 * Also matches other escaped characters to handle:
 *
 * - useless escapes:
     ```js
     const str = "\class"
     ```
 * - escaped newline literals:
     ```js
     const str = "class-a\
     class-b"
     ```
 *
 **/
const ESCAPE_SEQUENCE_REGEX = /^\\(\d{1,3}|['"\\nrvtbf]|u\d{4}|u\{\d{1,6}\}|x[a-fA-F0-9]{2}|[^'"\\nrvtbfux\d])/;

interface RawMappingEntry {
  character: string;
  index: number;
}

// create a mapping from value index to raw index
// this is to accommodate the beginning quote character and escape sequences
export default function createMapping(raw: string, value: string): Array<RawMappingEntry> {
  // offset starts at one to accommodate quote character in raw string
  let offset = 1;

  function getRawIndices(character: string, index: number): number {
    const rawIndex = index + offset;
    const rawCharacter = raw[rawIndex] ?? null;

    if (rawCharacter === character) {
      return rawIndex;
    } else if (rawCharacter === "\\") {
      const match = ESCAPE_SEQUENCE_REGEX.exec(raw.substring(rawIndex));
      const sequence = (match ?? [])[0];

      switch (sequence) {
        case undefined: {
          const details = JSON.stringify({ raw, rawCharacter, rawIndex, value, character, index, match });
          throw new Error("Unexpected non-match for escape sequence: " + details);
        }
        case "\\\n":
          // escaped newlines are removed entirely from string values
          // as such, no index in `value` can map to the current `raw` index
          // this also means `character` actually maps to the next non-escape-sequence character in `raw`
          offset += 2;
          return getRawIndices(character, index);
        case "\\\r\n":
          // escaped newlines are removed entirely from string values
          // as such, no index in `value` can map to the current `raw `index
          // this also means `character` actually maps to the next non-escape-sequence character in `raw`
          offset += 3;
          return getRawIndices(character, index);
        default:
          // other escape sequences in `raw` should be collapsed into a single character in `value`
          // TODO: handle unicode escapes
          offset += sequence.length - 1;
          return rawIndex;
      }
    } else {
      const details = JSON.stringify({ raw, rawCharacter, rawIndex, value, character, index });
      throw new Error("Unexpected mismatch between raw and processed strings: " + details);
    }
  }

  return Array.from(value).map((character, index) => ({ character, index: getRawIndices(character, index) }));
}

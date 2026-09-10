export type CharacterGrade = {
  character: string;
  status: "correct" | "incorrect";
  /** Normalized position (0–1 fraction of image width/height) of where this
   * character sits in the photo, so a correction mark can be drawn there.
   * Undefined if the model didn't return a usable position. */
  x?: number;
  y?: number;
};

export function buildGradingPrompt(words: string[]) {
  return (
    `Compare the handwriting in this Tian Zige grid against the expected ` +
    `spelling list [${words.join(", ")}]. ` +
    `Return a JSON array detailing which words were written correctly or ` +
    `incorrectly. For every word that has ANY handwriting attempt in a ` +
    `grid cell — including a WRONG attempt, e.g. a misspelling, wrong ` +
    `character, or illegible scrawl — also give "x" and "y": numbers ` +
    `between 0 and 1, the fraction of the image width and height ` +
    `respectively, marking the center of that grid cell (0,0 is the ` +
    `top-left corner of the image). Give a position for wrong attempts ` +
    `too, not just correct ones — a wrong attempt still occupies a cell. ` +
    `Only OMIT "x" and "y" for a word whose grid cell is completely ` +
    `blank/empty, with no handwriting attempt at all for it anywhere in ` +
    `the photo. Respond with ONLY a JSON array, no prose, in this exact ` +
    `shape: [{"character": "操场", "status": "correct", "x": 0.18, ` +
    `"y": 0.42}, {"character": "礼堂", "status": "incorrect", "x": 0.5, ` +
    `"y": 0.5}, {"character": "老师", "status": "incorrect"}, ...] — the ` +
    `last example has no position because that word's cell was left ` +
    `blank. Include every word from the list exactly once, using ` +
    `"correct" or "incorrect" as the status.`
  );
}

function clampFraction(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(1, Math.max(0, value));
}

/**
 * (0,0) is what a model tends to emit when it "fills in" a position for a
 * word it didn't actually find, despite being told to omit it — the exact
 * top-left pixel corner is a vanishingly unlikely genuine grid-cell center.
 * Treat that combination as "no position" rather than trusting it.
 */
function isLikelyPlaceholderOrigin(x: number | undefined, y: number | undefined) {
  return x === 0 && y === 0;
}

/**
 * Turns a model's raw JSON-array text response into a CharacterGrade for
 * every requested word, defaulting anything missing/malformed to
 * "incorrect" rather than silently shrinking the results table.
 */
export function parseCharacterGrades(
  text: string,
  words: string[],
): CharacterGrade[] {
  // Models sometimes wrap JSON in ```json fences despite instructions not to.
  const cleaned = text.trim().replace(/^```json\s*|```$/g, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }
  if (!Array.isArray(parsed)) throw new Error("Model JSON was not an array.");

  const graded = new Map<
    string,
    { status: "correct" | "incorrect"; x?: number; y?: number }
  >();
  for (const entry of parsed as Array<Record<string, unknown>>) {
    if (
      entry &&
      typeof entry.character === "string" &&
      (entry.status === "correct" || entry.status === "incorrect")
    ) {
      let x = clampFraction(entry.x);
      let y = clampFraction(entry.y);
      if (isLikelyPlaceholderOrigin(x, y)) {
        x = undefined;
        y = undefined;
      }
      graded.set(entry.character, { status: entry.status, x, y });
    }
  }

  return words.map((character) => {
    const match = graded.get(character);
    return {
      character,
      status: match?.status ?? "incorrect",
      x: match?.x,
      y: match?.y,
    };
  });
}

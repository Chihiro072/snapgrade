export type CharacterGrade = {
  character: string;
  status: "correct" | "incorrect";
};

export function buildGradingPrompt(words: string[]) {
  return (
    `Compare the handwriting in this Tian Zige grid against the expected ` +
    `spelling list [${words.join(", ")}]. ` +
    `Return a JSON array detailing which words were written correctly or ` +
    `incorrectly. Respond with ONLY a JSON array, no prose, in this exact ` +
    `shape: [{"character": "操场", "status": "correct"}, ...]. Include ` +
    `every word from the list exactly once, using "correct" or "incorrect" ` +
    `as the status.`
  );
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

  const graded = new Map<string, "correct" | "incorrect">();
  for (const entry of parsed as Array<Record<string, unknown>>) {
    if (
      entry &&
      typeof entry.character === "string" &&
      (entry.status === "correct" || entry.status === "incorrect")
    ) {
      graded.set(entry.character, entry.status);
    }
  }

  return words.map((character) => ({
    character,
    status: graded.get(character) ?? "incorrect",
  }));
}

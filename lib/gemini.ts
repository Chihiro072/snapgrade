import {
  buildGradingPrompt,
  parseCharacterGrades,
  type CharacterGrade,
} from "@/lib/grading-shared";

export type { CharacterGrade };

const MODEL = "gemini-3.6-flash";

/** Thrown when Gemini's free-tier quota is exhausted, so callers can fall
 * back to a different provider instead of failing the whole grading job. */
export class GeminiRateLimitError extends Error {}

/**
 * Sends the worksheet photo + the expected word list to Gemini and returns a
 * correct/incorrect verdict per character. Accuracy isn't the point here —
 * this wires up the real request/response flow the grading pipeline
 * depends on.
 */
export async function gradeWithGemini(
  imageBase64: string,
  mimeType: string,
  words: string[],
): Promise<CharacterGrade[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildGradingPrompt(words) },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429 || body.includes("RESOURCE_EXHAUSTED")) {
      throw new GeminiRateLimitError(
        `Gemini free-tier quota hit (${response.status}): ${body}`,
      );
    }
    throw new Error(`Gemini request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const text: string | undefined =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no gradable content.");

  return parseCharacterGrades(text, words);
}

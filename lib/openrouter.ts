import {
  buildGradingPrompt,
  parseCharacterGrades,
  type CharacterGrade,
} from "@/lib/grading-shared";

// Free, vision-capable fallback used only when Gemini's own free quota is
// exhausted. Shares OpenRouter's global free pool for this model, so it can
// itself be rate-limited under load — that's fine, it's a fallback, not the
// primary path.
const MODEL = "google/gemma-4-26b-a4b-it:free";

export async function gradeWithOpenRouter(
  imageBase64: string,
  mimeType: string,
  words: string[],
): Promise<CharacterGrade[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildGradingPrompt(words) },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const text: string | undefined = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned no gradable content.");

  return parseCharacterGrades(text, words);
}

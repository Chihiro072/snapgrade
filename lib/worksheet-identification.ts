export type WorksheetCandidate = {
  id: string;
  title: string;
  moeLevel: string;
  weekNumber: number | null;
  words: string[];
};

export class WorksheetNotIdentifiedError extends Error {}

const MODEL = "gemini-3.6-flash";

/**
 * Matches a photographed, SnapGrade-generated worksheet to a Syllabus lesson
 * using its printed heading and guide words. The model is explicitly allowed
 * to return no result; a plausible guess must never decide the word list.
 */
export async function identifyWorksheetLesson(
  imageBase64: string,
  mimeType: string,
  candidates: WorksheetCandidate[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  if (candidates.length === 0) throw new Error("No Syllabus lessons are available to match.");

  const prompt = [
    "Identify which candidate SnapGrade worksheet is shown in the image.",
    "Use only the printed header (MOE level, week, title) and printed guide words.",
    "Ignore handwriting when identifying the worksheet.",
    "Return {\"lessonId\": \"<exact candidate id>\"} only if one candidate is clearly visible.",
    "If the header is cropped, blurry, absent, or two candidates could match, return {\"lessonId\": null}.",
    "Never infer an ID from handwriting or choose a close match.",
    `Candidates: ${JSON.stringify(candidates)}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      }),
    },
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Worksheet identification failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const text: string | undefined = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Worksheet identification returned no result.");

  let lessonId: unknown;
  try {
    lessonId = JSON.parse(text.trim().replace(/^```json\s*|```$/g, ""))?.lessonId;
  } catch {
    throw new Error("Worksheet identification returned invalid JSON.");
  }
  if (typeof lessonId === "string" && candidates.some((candidate) => candidate.id === lessonId)) {
    return lessonId;
  }
  throw new WorksheetNotIdentifiedError(
    "We could not identify this worksheet. Retake the photo with the printed title and MOE header visible.",
  );
}

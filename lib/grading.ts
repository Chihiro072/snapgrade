import { GeminiRateLimitError, gradeWithGemini } from "@/lib/gemini";
import { gradeWithOpenRouter } from "@/lib/openrouter";
import type { CharacterGrade } from "@/lib/grading-shared";

export type { CharacterGrade };

/**
 * Grades a worksheet photo against the expected word list, preferring
 * Gemini's free tier and falling back to OpenRouter's free Gemma vision
 * model only when Gemini's quota is exhausted.
 */
export async function gradeWorksheet(
  imageBase64: string,
  mimeType: string,
  words: string[],
): Promise<CharacterGrade[]> {
  try {
    return await gradeWithGemini(imageBase64, mimeType, words);
  } catch (error) {
    if (!(error instanceof GeminiRateLimitError)) throw error;
    try {
      return await gradeWithOpenRouter(imageBase64, mimeType, words);
    } catch (fallbackError) {
      const fallbackMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Unknown fallback error.";
      throw new Error(
        `Gemini quota exhausted and OpenRouter fallback also failed: ${fallbackMessage}`,
      );
    }
  }
}

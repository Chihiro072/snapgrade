/**
 * Fallback spelling list used when a submission isn't tied to a lesson with
 * its own `word_list` (e.g. a quick scan from the camera screen without
 * picking a syllabus lesson first).
 */
export const DEFAULT_WORD_LIST = [
  "操场",
  "礼堂",
  "老师",
  "校园",
  "同学",
  "教室",
  "图书馆",
  "食堂",
  "花园",
  "运动场",
];

/**
 * Display-only pinyin for the default word list, since neither `lessons`
 * nor `character_results` store pronunciation. A lesson-specific word list
 * simply won't show pinyin under its characters.
 */
export const PINYIN_BY_CHARACTER: Record<string, string> = {
  操场: "cāo chǎng",
  礼堂: "lǐ táng",
  老师: "lǎo shī",
  校园: "xiào yuán",
  同学: "tóng xué",
  教室: "jiào shì",
  图书馆: "tú shū guǎn",
  食堂: "shí táng",
  花园: "huā yuán",
  运动场: "yùn dòng chǎng",
};

/**
 * A lesson's `word_list` column holds `{word, pinyin}` objects; extracts
 * just the word text, tolerating plain strings too for defensiveness.
 */
export function extractWords(wordList: unknown): string[] {
  if (!Array.isArray(wordList)) return [];
  return wordList
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : typeof entry === "object" && entry && "word" in entry
          ? String((entry as { word: unknown }).word)
          : null,
    )
    .filter((w): w is string => Boolean(w));
}

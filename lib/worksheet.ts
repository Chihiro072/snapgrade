import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { join } from "node:path";

// Rendered at 150dpi, A4 proportions (8.27" x 11.69"), then scaled onto a
// real A4-point PDF page. Vercel doesn't ship Chinese fonts, so point Sharp's
// Fontconfig at the bundled Noto Sans SC font before it rasterizes SVG text.
process.env.FONTCONFIG_FILE = join(process.cwd(), "fonts.conf");
const DPI = 150;
const PAGE_W = Math.round(8.27 * DPI);
const PAGE_H = Math.round(11.69 * DPI);
const A4_POINTS_W = 595.28;
const A4_POINTS_H = 841.89;

const MARGIN = 55;
const CELL = 100;
const CELL_GAP = 12;
const CELLS_PER_CHARACTER = 3;
const ROWS_FIRST_PAGE = 10;
const ROWS_OTHER_PAGES = 11;

export type WorksheetLesson = {
  title: string;
  moe_level: string;
  week_number: number | null;
  word_list: string[];
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cellSvg(x: number, y: number, size: number, guideChar?: string) {
  const guide = guideChar
    ? `<text x="${x + size / 2}" y="${y + size / 2 + size * 0.32}" font-size="${size * 0.72}" text-anchor="middle" font-family="Noto Sans SC, sans-serif" fill="#c7c7c7">${escapeXml(guideChar)}</text>`
    : "";
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="white" stroke="#333" stroke-width="2"/>
    <line x1="${x + size / 2}" y1="${y}" x2="${x + size / 2}" y2="${y + size}" stroke="#bbb" stroke-width="1" stroke-dasharray="6,6"/>
    <line x1="${x}" y1="${y + size / 2}" x2="${x + size}" y2="${y + size / 2}" stroke="#bbb" stroke-width="1" stroke-dasharray="6,6"/>
    ${guide}`;
}

type Row = { word: string; chars: string[] };

function buildPageSvg(
  lesson: WorksheetLesson,
  rows: Row[],
  pageIndex: number,
  pageCount: number,
) {
  const parts: string[] = [];
  let y = MARGIN;

  if (pageIndex === 0) {
    const meta = `MOE ${lesson.moe_level} SYLLABUS${lesson.week_number ? ` · WEEK ${lesson.week_number}` : ""}`;
    parts.push(
      `<text x="${MARGIN}" y="${y + 18}" font-size="20" font-family="Arial" fill="#71847e">${escapeXml(meta)}</text>`,
    );
    y += 44;
    parts.push(
      `<text x="${MARGIN}" y="${y + 30}" font-size="34" font-weight="bold" font-family="Noto Sans SC, Arial, sans-serif" fill="#273b38">${escapeXml(lesson.title)}</text>`,
    );
    y += 58;
    parts.push(
      `<line x1="${MARGIN}" y1="${y}" x2="${PAGE_W - MARGIN}" y2="${y}" stroke="#ccc" stroke-width="1.5"/>`,
    );
    y += 42;
    parts.push(
      `<text x="${MARGIN}" y="${y + 14}" font-size="18" font-family="Arial" fill="#444">Name: ______________________________      Date: ______________</text>`,
    );
    y += 50;
  } else {
    y += 6;
  }

  for (const row of rows) {
    parts.push(
      `<text x="${MARGIN}" y="${y + 6}" font-size="22" font-weight="bold" font-family="Noto Sans SC, Arial, sans-serif" fill="#273b38">${escapeXml(row.word)}</text>`,
    );
    y += 16;
    let x = MARGIN;
    // Every character gets its own three-cell practice group. Cell size
    // tightens only for unusually long words, keeping the word on one row.
    const cellCount = row.chars.length * CELLS_PER_CHARACTER;
    const availableWidth = PAGE_W - MARGIN * 2;
    const cellSize = Math.min(
      CELL,
      (availableWidth - CELL_GAP * (cellCount - 1)) / cellCount,
    );
    for (let i = 0; i < cellCount; i++) {
      const characterIndex = Math.floor(i / CELLS_PER_CHARACTER);
      const isGuideCell = i % CELLS_PER_CHARACTER === 0;
      parts.push(cellSvg(x, y, cellSize, isGuideCell ? row.chars[characterIndex] : undefined));
      x += cellSize + CELL_GAP;
    }
    y += cellSize + 28;
  }

  parts.push(
    `<text x="${PAGE_W - MARGIN}" y="${PAGE_H - 28}" font-size="14" font-family="Arial" text-anchor="end" fill="#999">Page ${pageIndex + 1} of ${pageCount} · Scan the completed sheet with SnapGrade to grade</text>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}"><rect width="${PAGE_W}" height="${PAGE_H}" fill="white"/>${parts.join("\n")}</svg>`;
}

function paginate(rows: Row[]): Row[][] {
  const pages: Row[][] = [];
  let i = 0;
  let first = true;
  while (i < rows.length) {
    const size = first ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGES;
    pages.push(rows.slice(i, i + size));
    i += size;
    first = false;
  }
  return pages.length ? pages : [[]];
}

/**
 * Renders a printable A4 Tian Zige practice worksheet for a lesson's word
 * list: one row of trace-and-copy grid cells per character, a name/date
 * line, and pagination if the word list is long.
 */
export async function renderWorksheetPdf(
  lesson: WorksheetLesson,
): Promise<Uint8Array> {
  const rows: Row[] = [];
  for (const word of lesson.word_list) rows.push({ word, chars: Array.from(word) });

  const pages = paginate(rows);
  const pdfDoc = await PDFDocument.create();

  for (let p = 0; p < pages.length; p++) {
    const svg = buildPageSvg(lesson, pages[p], p, pages.length);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    const image = await pdfDoc.embedPng(png);
    const page = pdfDoc.addPage([A4_POINTS_W, A4_POINTS_H]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: A4_POINTS_W,
      height: A4_POINTS_H,
    });
  }

  return pdfDoc.save();
}

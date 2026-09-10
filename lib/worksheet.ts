import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

// Rendered at 150dpi, A4 proportions (8.27" x 11.69"), then scaled onto a
// real A4-point PDF page. Text is rasterized (not a real embedded font) so
// CJK glyphs render correctly using whatever CJK font the runtime has,
// without needing to bundle/license a font file.
const DPI = 150;
const PAGE_W = Math.round(8.27 * DPI);
const PAGE_H = Math.round(11.69 * DPI);
const A4_POINTS_W = 595.28;
const A4_POINTS_H = 841.89;

const MARGIN = 70;
const CELL = 130;
const CELL_GAP = 12;
const CELLS_PER_ROW = 6;
const ROWS_FIRST_PAGE = 5;
const ROWS_OTHER_PAGES = 6;

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

function cellSvg(x: number, y: number, guideChar?: string) {
  const guide = guideChar
    ? `<text x="${x + CELL / 2}" y="${y + CELL / 2 + CELL * 0.32}" font-size="${CELL * 0.72}" text-anchor="middle" font-family="SimSun, 'Microsoft YaHei', 'Noto Sans SC', sans-serif" fill="#c7c7c7">${escapeXml(guideChar)}</text>`
    : "";
  return `
    <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="white" stroke="#333" stroke-width="2"/>
    <line x1="${x + CELL / 2}" y1="${y}" x2="${x + CELL / 2}" y2="${y + CELL}" stroke="#bbb" stroke-width="1" stroke-dasharray="6,6"/>
    <line x1="${x}" y1="${y + CELL / 2}" x2="${x + CELL}" y2="${y + CELL / 2}" stroke="#bbb" stroke-width="1" stroke-dasharray="6,6"/>
    ${guide}`;
}

type Row = { word: string; char: string };

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
      `<text x="${MARGIN}" y="${y + 30}" font-size="34" font-weight="bold" font-family="Arial, 'Microsoft YaHei', 'Noto Sans SC', sans-serif" fill="#273b38">${escapeXml(lesson.title)}</text>`,
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
      `<text x="${MARGIN}" y="${y + 6}" font-size="22" font-weight="bold" font-family="Arial, 'Microsoft YaHei', 'Noto Sans SC', sans-serif" fill="#273b38">${escapeXml(row.word)}</text>`,
    );
    y += 16;
    let x = MARGIN;
    for (let i = 0; i < CELLS_PER_ROW; i++) {
      parts.push(cellSvg(x, y, i === 0 ? row.char : undefined));
      x += CELL + CELL_GAP;
    }
    y += CELL + 40;
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
  for (const word of lesson.word_list) {
    for (const char of Array.from(word)) rows.push({ word, char });
  }

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

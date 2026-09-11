import nextEnv from "@next/env";
import sharp from "sharp";
import {
  identifyWorksheetLesson,
  type WorksheetCandidate,
} from "../lib/worksheet-identification.ts";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required for this live verification.");
}

const target: WorksheetCandidate = {
  id: "integration-test-p1-week-1",
  title: "Classroom Objects",
  moeLevel: "P1",
  weekNumber: 1,
  words: ["book", "pen", "pencil"],
};
const decoy: WorksheetCandidate = {
  id: "integration-test-p2-week-4",
  title: "At the Market",
  moeLevel: "P2",
  weekNumber: 4,
  words: ["apple", "bread", "milk"],
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600">
  <rect width="100%" height="100%" fill="white"/>
  <text x="90" y="120" font-family="Arial" font-size="34" fill="#71847e">MOE P1 SYLLABUS · WEEK 1</text>
  <text x="90" y="210" font-family="Arial" font-size="62" font-weight="bold" fill="#273b38">Classroom Objects</text>
  <text x="90" y="300" font-family="Arial" font-size="30" fill="#444">Name: ____________________    Date: ______________</text>
  <text x="90" y="430" font-family="Arial" font-size="48" font-weight="bold">book</text>
  <text x="90" y="610" font-family="Arial" font-size="48" font-weight="bold">pen</text>
  <text x="90" y="790" font-family="Arial" font-size="48" font-weight="bold">pencil</text>
</svg>`;

const imageBase64 = (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
const identified = await identifyWorksheetLesson(imageBase64, "image/png", [target, decoy]);
if (identified !== target.id) {
  throw new Error(`Wrong lesson identified: expected ${target.id}, got ${identified}.`);
}

console.log(`PASS: identified ${identified}.`);

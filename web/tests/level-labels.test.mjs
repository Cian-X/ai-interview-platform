import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/utils/constants.ts", import.meta.url), "utf8");

test("F-04: proficiency labels use Indonesian only for vacancy form", () => {
  const block = source.match(/export const LEVEL_LABELS[^=]*=\s*\{([^}]+)\}/)?.[1] ?? "";
  const labels = Object.fromEntries([...block.matchAll(/(\d):\s*"([^"]+)"/g)].map((m) => [Number(m[1]), m[2]]));
  assert.deepEqual(labels, {
    1: "Pemula",
    2: "Dasar",
    3: "Menengah",
    4: "Mahir",
    5: "Ahli",
  });
  const vacancyPages = ["../src/pages/vacancies/VacancyNewPage.tsx", "../src/pages/vacancies/VacancyEditPage.tsx"];
  for (const page of vacancyPages) {
    const pageSource = readFileSync(new URL(page, import.meta.url), "utf8");
    assert.match(pageSource, /labelFn=\{getLevelLabel\}/);
  }
  assert.match(readFileSync(new URL("../src/components/assessment/SkillCard.tsx", import.meta.url), "utf8"), /<LevelRadio/);
  assert.match(readFileSync(new URL("../src/components/assessment/LevelRadio.tsx", import.meta.url), "utf8"), /`L\$\{level\}`/);
});

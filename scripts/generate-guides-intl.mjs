import fs from "node:fs/promises";
import path from "node:path";

const SRC = "src/app/guides/_data/mbti/guides.ts";
const OUT_EN = "src/app/guides/_data/mbti/guides.en.json";
const OUT_JA = "src/app/guides/_data/mbti/guides.ja.json";

const SKIP_KEYS = new Set(["slug", "groupType", "type", "related"]);
const SEP = "\n⟬S3P_XY9⟭\n";

const KO_NORMALIZE_RULES = [
  [/드립/g, "농담"],
  [/단톡/g, "단체 채팅"],
  [/총대/g, "진행 담당"],
  [/노쇼/g, "무단 불참"],
  [/티키타카/g, "호흡"],
  [/온보딩/g, "적응 지원"],
  [/틸트/g, "감정 흔들림"],
  [/복붙/g, "복사해서 붙여넣기"],
  [/케미/g, "궁합"],
  [/뒷얘기/g, "뒤에서 하는 말"],
];

function findGuidesArray(source) {
  const marker = "export const GUIDES";
  const from = source.indexOf(marker);
  if (from < 0) throw new Error("GUIDES marker not found");
  const eqPos = source.indexOf("=", from);
  if (eqPos < 0) throw new Error("GUIDES assignment not found");
  const arrStart = source.indexOf("[", eqPos);
  if (arrStart < 0) throw new Error("GUIDES array start not found");

  let i = arrStart;
  let depth = 0;
  let str = null;
  let lineComment = false;
  let blockComment = false;

  while (i < source.length) {
    const ch = source[i];
    const nx = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      i += 1;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && nx === "/") {
        blockComment = false;
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (str) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === str) str = null;
      i += 1;
      continue;
    }

    if (ch === "/" && nx === "/") {
      lineComment = true;
      i += 2;
      continue;
    }
    if (ch === "/" && nx === "*") {
      blockComment = true;
      i += 2;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      str = ch;
      i += 1;
      continue;
    }

    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(arrStart, i + 1);
      }
    }

    i += 1;
  }

  throw new Error("Could not find end of GUIDES array");
}

function collectStrings(node, out = []) {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectStrings(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      collectStrings(v, out);
    }
  }
  return out;
}

function replaceStrings(node, map) {
  if (typeof node === "string") return map.get(node) ?? node;
  if (Array.isArray(node)) return node.map((item) => replaceStrings(item, map));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) {
        out[k] = v;
      } else {
        out[k] = replaceStrings(v, map);
      }
    }
    return out;
  }
  return node;
}

function chunkTexts(texts, maxChars = 2600, maxItems = 20) {
  const chunks = [];
  let cur = [];
  let size = 0;

  for (const t of texts) {
    const add = t.length + SEP.length;
    if (cur.length && (cur.length >= maxItems || size + add > maxChars)) {
      chunks.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(t);
    size += add;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

function cleanTranslated(text) {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeKoForTranslate(text) {
  let out = text;
  for (const [re, to] of KO_NORMALIZE_RULES) {
    out = out.replace(re, to);
  }
  return out.replace(/\p{Extended_Pictographic}/gu, "").replace(/\uFE0F/g, "");
}

function postFixTranslation(text, locale) {
  let out = text;
  if (locale === "en") {
    out = out
      .replace(/\bblood remains\b/gi, "fatigue remains")
      .replace(/\bfriend gatherings\b/gi, "friend groups")
      .replace(/\bfriends gathering\b/gi, "friends group")
      .replace(/\bdrip\b/gi, "joke");
  }
  if (locale === "ja") {
    out = out
      .replace(/ドリップ/g, "冗談")
      .replace(/ファクト/g, "事実")
      .replace(/友達会議/g, "友だちの集まり")
      .replace(/ケミ/g, "相性");
  }
  return out;
}

async function translateChunk(batch, sl, tl) {
  const joined = batch.join(SEP);
  const params = new URLSearchParams({
    client: "gtx",
    sl,
    tl,
    dt: "t",
    q: joined,
  });

  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  const data = await res.json();
  const text = (data?.[0] ?? []).map((x) => x?.[0] ?? "").join("");
  const parts = text.split(SEP).map(cleanTranslated);

  if (parts.length !== batch.length) {
    // Fallback to single translate for this chunk
    const singles = [];
    for (const line of batch) {
      const p = new URLSearchParams({ client: "gtx", sl, tl, dt: "t", q: line });
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?${p.toString()}`);
      const d = await r.json();
      singles.push(cleanTranslated((d?.[0] ?? []).map((x) => x?.[0] ?? "").join("")));
      await new Promise((r2) => setTimeout(r2, 120));
    }
    return singles;
  }

  return parts;
}

async function translateAll(uniqueStrings, sl, tl, normalizeSource = false) {
  const normalizedByOriginal = new Map(
    uniqueStrings.map((s) => [s, normalizeSource && sl === "ko" ? normalizeKoForTranslate(s) : s])
  );
  const uniqueNormalized = [...new Set([...normalizedByOriginal.values()])];
  const chunks = chunkTexts(uniqueNormalized);
  const out = new Map();

  for (let i = 0; i < chunks.length; i += 1) {
    const batch = chunks[i];
    let translated = null;

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        translated = await translateChunk(batch, sl, tl);
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await new Promise((r) => setTimeout(r, 350 * attempt));
      }
    }

    for (let j = 0; j < batch.length; j += 1) {
      out.set(batch[j], postFixTranslation(translated[j] || batch[j], tl));
    }

    if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
      console.log(`[${tl}] ${i + 1}/${chunks.length} chunks done`);
    }

    await new Promise((r) => setTimeout(r, 90));
  }

  const outByOriginal = new Map();
  for (const [orig, normalized] of normalizedByOriginal.entries()) {
    outByOriginal.set(orig, out.get(normalized) ?? orig);
  }
  return outByOriginal;
}

async function main() {
  const raw = await fs.readFile(SRC, "utf8");
  const arrCode = findGuidesArray(raw);
  const guides = Function(`"use strict"; return (${arrCode});`)();

  const strings = collectStrings(guides, []);
  const uniqueStrings = [...new Set(strings.filter((s) => typeof s === "string" && s.trim().length > 0))];

  console.log(`guides: ${guides.length}`);
  console.log(`strings: ${strings.length}, unique: ${uniqueStrings.length}`);

  const mapEn = await translateAll(uniqueStrings, "ko", "en", true);
  const uniqueEn = [...new Set([...mapEn.values()])];
  const mapJaFromEn = await translateAll(uniqueEn, "en", "ja", false);
  const mapJa = new Map();
  for (const key of uniqueStrings) {
    const enText = mapEn.get(key) ?? key;
    mapJa.set(key, mapJaFromEn.get(enText) ?? key);
  }

  const guidesEn = replaceStrings(guides, mapEn);
  const guidesJa = replaceStrings(guides, mapJa);

  await fs.writeFile(OUT_EN, `${JSON.stringify(guidesEn, null, 2)}\n`, "utf8");
  await fs.writeFile(OUT_JA, `${JSON.stringify(guidesJa, null, 2)}\n`, "utf8");

  console.log(`written: ${path.basename(OUT_EN)}, ${path.basename(OUT_JA)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

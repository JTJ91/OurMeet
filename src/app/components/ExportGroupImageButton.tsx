"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function makeFileName(groupName?: string) {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const safe = (groupName ?? "group").replace(/[\\/:*?"<>|]/g, "").slice(0, 30);
  return `moimrank_${safe}_${y}${m}${day}_${hh}${mm}.png`;
}

/**
 * ✅ 캡처에서 자주 터지는 CSS 색상 함수들을(html-to-image 미지원) 제거/대체
 * - lab()/lch()/oklab()/oklch()/color-mix() 등이 일부 브라우저에서 computedStyle로 나오는 케이스 대응
 */
function sanitizeUnsupportedColors(root: HTMLElement) {
  const bad = /(lab\(|lch\(|oklab\(|oklch\(|color-mix\(|color\()/i;

  const all = Array.from(root.querySelectorAll<HTMLElement>("*"));
  for (const el of all) {
    const cs = getComputedStyle(el);

    // ✅ html-to-image가 주로 파싱하는 컬러 관련 속성들만 점검
    const props: Array<[keyof CSSStyleDeclaration, string]> = [
      ["color", cs.color],
      ["backgroundColor", cs.backgroundColor],
      ["borderTopColor", cs.borderTopColor],
      ["borderRightColor", cs.borderRightColor],
      ["borderBottomColor", cs.borderBottomColor],
      ["borderLeftColor", cs.borderLeftColor],
      ["outlineColor", cs.outlineColor],
      ["textDecorationColor", cs.textDecorationColor as any],
    ];

    // computedStyle 값에 bad 함수가 있으면 해당 속성은 인라인로 안전 값 강제
    for (const [prop, val] of props) {
      if (typeof val === "string" && bad.test(val)) {
        // 빈 값으로 두면 상속/기본으로 돌아가서 안전해지는 경우가 많음
        // (필요하면 아래처럼 강제색을 넣어도 됨: el.style.setProperty(prop as any, "#0F172A")
        el.style.setProperty(prop as any, "");
      }
    }
  }
}

function waitImage(img: HTMLImageElement) {
  // decode()가 가장 깔끔하지만 일부 환경에서 예외가 날 수 있어서 load fallback
  const p = img.decode ? img.decode().catch(() => undefined) : Promise.resolve(undefined);
  return p.then(() => {
    if (img.complete) return;
    return new Promise<void>((res) => {
      img.onload = () => res();
      img.onerror = () => res();
    });
  });
}

export default function ExportGroupImageButton({
  targetId = "capture-root",
  fileTitle,
}: {
  targetId?: string;
  fileTitle?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const onDownload = async () => {
    if (isExporting) return;

    const el = document.getElementById(targetId) as HTMLElement | null;
    if (!el) {
      alert("저장할 영역을 찾지 못했어요.");
      return;
    }

    // ✅ 캡처 전에 canvas -> img 치환 (그리고 img가 로드될 때까지 기다림)
    const replaceCanvasWithImages = async (root: HTMLElement) => {
      const replaces: { canvas: HTMLCanvasElement; img: HTMLImageElement }[] = [];
      const canvases = Array.from(root.querySelectorAll("canvas"));

      for (const canvas of canvases) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          const img = new Image();
          img.src = dataUrl;

          // 크기/레이아웃 유지
          const rect = canvas.getBoundingClientRect();
          img.style.width = `${rect.width}px`;
          img.style.height = `${rect.height}px`;
          img.style.display = getComputedStyle(canvas).display === "block" ? "block" : "inline-block";
          img.style.borderRadius = getComputedStyle(canvas).borderRadius;

          // 캡처 시 품질을 위해 렌더링 힌트
          img.style.imageRendering = "auto";

          // canvas 숨기고 img 삽입
          canvas.style.visibility = "hidden";
          canvas.parentElement?.insertBefore(img, canvas);

          replaces.push({ canvas, img });
        } catch (e) {
          console.warn("canvas toDataURL failed:", e);
        }
      }

      // ✅ 이미지가 실제로 디코드/로드될 때까지 대기 (이거 안 하면 빈 캔버스처럼 찍히는 경우가 있음)
      await Promise.all(replaces.map((r) => waitImage(r.img)));

      // 원복 함수 반환
      return () => {
        for (const r of replaces) {
          r.img.remove();
          r.canvas.style.visibility = "";
        }
      };
    };

    try {
      setIsExporting(true);

      // ✅ 폰트 로딩 대기 (텍스트 깨짐/빈칸 방지)
      // @ts-ignore
      if (document.fonts?.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }

      // 캡처 모드 클래스(선택): blur/backdrop이 캡처에서 문제면 여기서 끌 수 있음
      el.classList.add("capture-mode");

      // ✅ html-to-image가 싫어하는 컬러 함수 제거
      sanitizeUnsupportedColors(el);

      // ✅ 캔버스 치환 + 로드 대기
      const restoreCanvas = await replaceCanvasWithImages(el);

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 2),
        backgroundColor: "#F5F9FF",

        // ✅ 캡처 중 "이미지 저장 버튼" 같은 요소를 숨기고 싶으면 data-ignore-capture 사용 가능
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          if (node.dataset?.ignoreCapture === "1") return false;
          return true;
        },
      });

      restoreCanvas();
      el.classList.remove("capture-mode");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = makeFileName(fileTitle);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("이미지 저장에 실패했어요. (일부 브라우저/요소 때문에 캡처가 막힐 수 있어요)");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={isExporting}
      title="이미지로 저장"
      className="
        fixed bottom-5 left-5 z-[9999]
        inline-flex items-center gap-2
        px-4 py-2.5
        rounded-full
        bg-white/80
        text-slate-800
        text-[13px] font-semibold
        shadow-md ring-1 ring-black/5
        backdrop-blur-md
        hover:bg-white hover:shadow-lg
        active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
      "
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      // ✅ 혹시 캡처 루트가 더 커질 때 버튼이 같이 찍히는 상황이면 이걸 1로
      data-ignore-capture="1"
    >
      <Download className="h-4 w-4 text-slate-500" />
      {isExporting ? "저장 중..." : "이미지로 저장"}
    </button>
  );
}

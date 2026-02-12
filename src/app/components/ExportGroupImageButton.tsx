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

    // ✅ 캡처 전에 canvas -> img 치환
    const replaceCanvasWithImages = (root: HTMLElement) => {
    const replaces: { canvas: HTMLCanvasElement; img: HTMLImageElement }[] = [];
    const canvases = Array.from(root.querySelectorAll("canvas"));

    for (const canvas of canvases) {
        try {
        const dataUrl = canvas.toDataURL("image/png");

        const img = new Image();
        img.src = dataUrl;

        // 크기/레이아웃 유지
        const rect = canvas.getBoundingClientRect();
        img.width = canvas.width || Math.round(rect.width);
        img.height = canvas.height || Math.round(rect.height);

        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.display = getComputedStyle(canvas).display === "block" ? "block" : "inline-block";
        img.style.borderRadius = getComputedStyle(canvas).borderRadius;

        // canvas 숨기고 img 삽입
        canvas.style.visibility = "hidden";
        canvas.parentElement?.insertBefore(img, canvas);

        replaces.push({ canvas, img });
        } catch (e) {
        // WebGL이거나 tainted canvas면 여기로 올 수 있음
        // 이 경우는 그래프 렌더쪽에서 CORS/폰트/이미지 사용 여부 확인 필요
        console.warn("canvas toDataURL failed:", e);
        }
    }

    // 원복 함수 반환
    return () => {
        for (const r of replaces) {
        r.img.remove();
        r.canvas.style.visibility = "";
        }
    };
    };


    const el = document.getElementById(targetId);
    if (!el) {
      alert("저장할 영역을 찾지 못했어요.");
      return;
    }

    try {
      setIsExporting(true);
      el.classList.add("capture-mode");
      const restoreCanvas = replaceCanvasWithImages(el);

      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: Math.min(2, window.devicePixelRatio || 2),
        backgroundColor: "#F5F9FF",
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
  >
    <Download className="h-4 w-4 text-slate-500" />
    {isExporting ? "저장 중..." : "이미지로 저장"}
  </button>
);


}

"use client";

import { useEffect, useState } from "react";

export default function BottomCTA() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:static sm:z-auto sm:mt-10">
      <div className="mx-auto max-w-[420px] px-5 pb-5 sm:pb-0">
        <div
          className={`
            rounded-3xl bg-white/80 p-3 ring-1 ring-black/5
            backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)]
            transition-all duration-200 ease-out
            ${isScrolling ? "scale-95 opacity-90" : "scale-100 opacity-100"}
            sm:scale-100 sm:opacity-100 sm:bg-transparent sm:shadow-none sm:ring-0 sm:p-0
          `}
        >
          <div className="grid grid-cols-2 gap-3">
            {/* 메인 CTA */}
            <button className="w-full rounded-2xl bg-[#1E88E5] px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#1E88E5]/90 active:scale-[0.98]">
                ✨ 모임 만들기
            </button>

            {/* 보조 CTA */}
            <button className="w-full rounded-2xl bg-white px-4 py-4 text-sm font-extrabold text-[#1E88E5] ring-1 ring-[#1E88E5]/30 transition-all duration-200 hover:bg-[#1E88E5]/5 active:scale-[0.98]">
                모임 참가하기
            </button>

            </div>
        </div>
      </div>
    </div>
  );
}

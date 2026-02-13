"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
  className?: string;
  fallbackHref?: string;
  icon?: string;
};

export default function BackNavButton({
  label = "뒤로가기",
  className,
  fallbackHref = "/",
  icon,
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className={className}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}


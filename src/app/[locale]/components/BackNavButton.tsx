"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  label?: string;
  className?: string;
  fallbackHref?: string;
  icon?: string;
};

export default function BackNavButton({
  label,
  className,
  fallbackHref = "/",
  icon,
}: Props) {
  const router = useRouter();
  const t = useTranslations("components.backNav");

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
      <span>{label ?? t("label")}</span>
    </button>
  );
}

import { getMessages } from "next-intl/server";

export async function ensurePageMessages(locale: string) {
  await getMessages({ locale });
}

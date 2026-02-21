import { getMessages } from "next-intl/server";
import { pickMessages } from "./pick-messages";

export async function getScopedMessages(locale: string, namespaces: readonly string[]) {
  const messages = await getMessages({ locale });
  return pickMessages(messages as Record<string, unknown>, namespaces);
}


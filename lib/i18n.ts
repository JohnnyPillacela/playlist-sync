export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export async function getMessages(locale: Locale, namespace: string) {
  return (await import(`@/messages/${locale}/${namespace}.json`)).default;
}

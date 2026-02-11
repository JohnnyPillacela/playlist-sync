"use client";

import Link from "next/link";

interface LanguageSwitcherProps {
  currentLocale: 'en' | 'es';
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  // Show the opposite language
  const targetLocale = currentLocale === 'en' ? 'es' : 'en';
  const targetPath = currentLocale === 'en' ? '/es' : '/';
  const displayText = targetLocale.toUpperCase();
  
  return (
    <div className="absolute left-4 top-4">
      <Link
        href={targetPath}
        onClick={() => {
          // Set cookie preference for the target language
          document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
        }}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
      >
        {displayText}
      </Link>
    </div>
  );
}

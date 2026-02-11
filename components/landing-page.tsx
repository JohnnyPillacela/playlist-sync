import { Button } from "@/components/ui/button";
import { LoginServiceButton } from "@/components/login-service-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export interface LandingPageMessages {
  appName: string;
  headline: string;
  subhead: string;
  tagline?: string;
  feature1: string;
  feature2: string;
  feature3: string;
  howItWorksTitle?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  ctaDashboard: string;
  ctaConnectSpotify: string;
  ctaConnectYoutube: string;
  ctaSubtext?: string;
  trustLine?: string;
  footer?: string;
}

interface LandingPageProps {
  messages: LandingPageMessages;
  locale?: Locale;
}

export function LandingPage({ messages, locale = 'en' }: LandingPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 md:px-6 md:py-12">
      <LanguageSwitcher currentLocale={locale} />
      <ThemeToggle className="absolute right-4 top-4" />
      
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 md:gap-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl font-bold md:text-5xl">
            {messages.appName}
          </p>
          {messages.tagline && (
            <p className="text-base text-muted-foreground md:text-lg">{messages.tagline}</p>
          )}
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl lg:text-6xl">{messages.headline}</h1>
          <p className="mt-2 max-w-xl text-lg text-muted-foreground md:text-xl">{messages.subhead}</p>
        </div>

        {/* Features Section */}
        <ul className="flex flex-col items-center gap-3 text-center text-base md:text-lg">
          <li>• {messages.feature1}</li>
          <li>• {messages.feature2}</li>
          <li>• {messages.feature3}</li>
        </ul>

        {/* CTA Section - Responsive Buttons */}
        <div className="flex w-full flex-col items-center gap-4 md:gap-5">
          {/* View all playlists - at the top */}
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              {messages.ctaDashboard}
            </Button>
          </Link>
          
          {/* Service buttons - stack on mobile, side-by-side centered on tablet+ */}
          <div className="flex w-full max-w-md flex-col gap-3 md:max-w-2xl md:flex-row md:justify-center md:gap-4">
            <LoginServiceButton
              service="spotify"
              authUrl="/api/spotify/auth"
              label={messages.ctaConnectSpotify}
            />
            <LoginServiceButton
              service="youtube"
              authUrl="/api/youtube/auth"
              label={messages.ctaConnectYoutube}
            />
          </div>
        </div>

        {/* CTA Subtext */}
        {messages.ctaSubtext && (
          <p className="text-center text-sm text-muted-foreground md:text-base">
            {messages.ctaSubtext}
          </p>
        )}

        {/* Trust Line and Footer */}
        <div className="flex flex-col items-center gap-3 text-center mt-4">
          {messages.trustLine && (
            <p className="text-sm text-muted-foreground md:text-base">{messages.trustLine}</p>
          )}
          {messages.footer && (
            <p className="text-sm text-muted-foreground md:text-base">{messages.footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}

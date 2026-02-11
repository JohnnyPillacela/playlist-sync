import { Button } from "@/components/ui/button";
import { LoginServiceButton } from "@/components/login-service-button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export interface LandingPageMessages {
  appName: string;
  headline: string;
  subhead: string;
  ctaDashboard: string;
  ctaConnectSpotify: string;
  ctaConnectYoutube: string;
  footer?: string;
}

interface LandingPageProps {
  messages: LandingPageMessages;
}

export function LandingPage({ messages }: LandingPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <p className="mb-1 text-2xl font-semibold text-muted-foreground">
        {messages.appName}
      </p>
      <h1 className="mb-2 text-5xl font-semibold">{messages.headline}</h1>
      <p className="mb-6 text-lg text-muted-foreground">{messages.subhead}</p>
      <div className="flex flex-col items-center gap-3">
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
      <Link href="/dashboard">
        <Button variant="outline" size="lg">
          {messages.ctaDashboard}
        </Button>
      </Link>
      {messages.footer && (
        <p className="mt-6 text-sm text-muted-foreground">{messages.footer}</p>
      )}
    </div>
  );
}

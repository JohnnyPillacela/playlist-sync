// /components/login-service-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

type ServiceConfig = {
  name: string;
  displayName: string;
  logo: string;
  colors: {
    bg: string;
    hover: string;
    text: string;
    border: string;
  };
};

const serviceConfigs: Record<string, ServiceConfig> = {
  spotify: {
    name: "spotify",
    displayName: "Spotify",
    logo: "/logos/spotify.svg",
    colors: {
      bg: "bg-green-50/50",
      hover: "hover:bg-green-100/60",
      text: "text-gray-900",
      border: "border-2 border-[#1DB954]",
    },
  },
  youtube: {
    name: "youtube",
    displayName: "YouTube Music",
    logo: "/logos/youtube-icon.svg",
    colors: {
      bg: "bg-red-50/50",
      hover: "hover:bg-red-100/60",
      text: "text-gray-900",
      border: "border-2 border-[#FF0033]",
    },
  },
};

interface LoginServiceButtonProps {
  service: string;
  authUrl: string;
  /** Optional label override for i18n (e.g. "Connect with Spotify" or "Conectar con Spotify") */
  label?: string;
}

export function LoginServiceButton({
  service,
  authUrl,
  label,
}: LoginServiceButtonProps) {
  const config = serviceConfigs[service];
  
  if (!config) {
    console.error(`Unknown service: ${service}`);
    return null;
  }

  const displayLabel = label ?? `Connect with ${config.displayName}`;

  return (
    <Button
      onClick={() => window.location.href = authUrl}
      size="lg"
      className={`${config.colors.bg} ${config.colors.hover} ${config.colors.text} ${config.colors.border} shadow-lg transition-all duration-200`}
    >
      <Image
        src={config.logo}
        alt={`${config.displayName} logo`}
        width={20}
        height={20}
        className="mr-2"
      />
      {displayLabel}
    </Button>
  );
}


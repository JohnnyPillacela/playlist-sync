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
      bg: "bg-white",
      hover: "hover:bg-gray-50",
      text: "text-gray-900",
      border: "border-2 border-[#1DB954]",
    },
  },
  youtube: {
    name: "youtube",
    displayName: "YouTube Music",
    logo: "/logos/youtube-icon.svg",
    colors: {
      bg: "bg-white",
      hover: "hover:bg-gray-50",
      text: "text-gray-900",
      border: "border-2 border-[#FF0033]",
    },
  },
};

interface LoginServiceButtonProps {
  service: string;
  authUrl: string;
}

export function LoginServiceButton({
  service,
  authUrl,
}: LoginServiceButtonProps) {
  const config = serviceConfigs[service];
  
  if (!config) {
    console.error(`Unknown service: ${service}`);
    return null;
  }

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
      Connect with {config.displayName}
    </Button>
  );
}


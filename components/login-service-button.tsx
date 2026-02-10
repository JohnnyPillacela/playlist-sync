// /components/login-service-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Music, Youtube, LucideIcon } from "lucide-react";

type ServiceConfig = {
  name: string;
  displayName: string;
  icon: LucideIcon;
  colors: {
    bg: string;
    hover: string;
    text: string;
  };
};

const serviceConfigs: Record<string, ServiceConfig> = {
  spotify: {
    name: "spotify",
    displayName: "Spotify",
    icon: Music,
    colors: {
      bg: "bg-[#1ED760]",
      hover: "hover:bg-[#1DB954]",
      text: "text-white",
    },
  },
  youtube: {
    name: "youtube",
    displayName: "YouTube Music",
    icon: Youtube,
    colors: {
      bg: "bg-[#FF0033]",
      hover: "hover:bg-[#CC0029]",
      text: "text-white",
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

  const Icon = config.icon;

  return (
    <Button
      onClick={() => window.location.href = authUrl}
      size="lg"
      className={`${config.colors.bg} ${config.colors.hover} ${config.colors.text} border-0 shadow-lg transition-all duration-200`}
    >
      <Icon className="mr-2 h-5 w-5" />
      Connect with {config.displayName}
    </Button>
  );
}


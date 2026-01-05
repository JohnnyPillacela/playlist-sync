// /components/login-service-button.tsx
"use client";

import { Button } from "@/components/ui/button";

interface LoginServiceButtonProps {
  serviceName: string;
  authUrl: string;
}

export function LoginServiceButton({
  serviceName,
  authUrl,
}: LoginServiceButtonProps) {
  return (
    <Button
      onClick={() => window.location.href = authUrl}
      variant="outline"
      size="sm"
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
    >
      Log in to {serviceName}
    </Button>
  );
}


import { Button } from "@/components/ui/button";

interface LoginServiceButtonProps {
  serviceName: string;
  onClick: () => void;
}

export function LoginServiceButton({
  serviceName,
  onClick,
}: LoginServiceButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
    >
      Log in to {serviceName}
    </Button>
  );
}


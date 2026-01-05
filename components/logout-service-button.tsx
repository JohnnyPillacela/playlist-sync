import { Button } from "@/components/ui/button";

interface LogoutServiceButtonProps {
  serviceName: string;
  onClick: () => void;
}

export function LogoutServiceButton({
  serviceName,
  onClick,
}: LogoutServiceButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      Log out of {serviceName}
    </Button>
  );
}

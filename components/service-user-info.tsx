// /components/service-user-info.tsx

import { GoogleUserInfo } from "@/lib/constants/google";
import { SpotifyUser } from "@/lib/constants/spotify";
import { LogoutServiceButton } from "./logout-service-button";
import { LoginServiceButton } from "./login-service-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface ServiceUserInfoProps {
  service: "spotify" | "youtube-music";
  serviceName: string; // Display name e.g., "Spotify", "YouTube Music"
  userData: SpotifyUser | GoogleUserInfo | null;
  authUrl: string; // Login handler
  onLogout: () => Promise<void>; // Logout handler
  extraFields?: { label: string; value: string | number }[]; // Optional extra data like playlist count
}

export default function ServiceUserInfo({
  service,
  serviceName,
  userData,
  authUrl,
  onLogout,
  extraFields,
}: ServiceUserInfoProps) {
  return (
    <Card className="border-muted">
        <CardHeader>
            <CardTitle className="text-2xl font-bold flex flex-col sm:flex-row sm:items-center gap-2">
              {serviceName}
              <Badge variant={userData ? "default" : "secondary"}>
                {userData ? "Connected" : "Not connected"}
              </Badge>
            </CardTitle>
        </CardHeader>
        {userData && (
          <CardContent className="space-y-3">
            {/* Email field - common to both services */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <span className="text-sm break-all">{userData.email}</span>
            </div>

            {/* Service-specific fields */}
            {service === "spotify" &&
              "country" in userData &&
              userData.country && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Country
                  </span>
                  <span className="text-sm">{userData.country}</span>
                </div>
              )}

            {service === "youtube-music" &&
              "name" in userData &&
              userData.name && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </span>
                  <span className="text-sm">{userData.name}</span>
                </div>
              )}

            {/* Extra fields (like playlist count, subscription type) */}
            {extraFields?.map((field, index) => (
              <div key={index} className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </span>
                <span className="text-sm font-semibold">{field.value}</span>
              </div>
            ))}
          </CardContent>
        )}

      <CardFooter>
        {userData ? (
          <LogoutServiceButton serviceName={serviceName} onClick={onLogout} />
        ) : (
          <LoginServiceButton service={service} authUrl={authUrl} />
        )}
      </CardFooter>
    </Card>
  );
}

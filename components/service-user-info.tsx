// /components/service-user-info.tsx

import { GoogleUserInfo } from "@/lib/constants/google";
import { SpotifyUser } from "@/lib/constants/spotify";
import { LogoutServiceButton } from "./logout-service-button";
import { LoginServiceButton } from "./login-service-button";

interface ServiceUserInfoProps {
  service: "spotify" | "youtube-music";
  serviceName: string; // Display name e.g., "Spotify", "YouTube Music"
  userData: SpotifyUser | GoogleUserInfo | null;
  authUrl: string; // Login handler
  onLogout: () => Promise<void>; // Logout handler
  extraFields?: { label: string; value: string | number }[]; // Optional extra data like playlist count
}

export default function ServiceUserInfo({ service, serviceName, userData, authUrl, onLogout, extraFields }: ServiceUserInfoProps) {
    return (
        <div key={service} className="flex flex-col gap-1 p-4 border rounded-lg bg-card">
            <h3 className="text-3xl font-semibold">{serviceName}</h3>
            {userData ? (
                <>
                    {/* Email field - common to both services */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-base">{userData.email}</span>
                    </div>

                    {/* Service-specific fields */}
                    {service === 'spotify' && 'country' in userData && userData.country && (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">Country</span>
                            <span className="text-base">{userData.country}</span>
                        </div>
                    )}

                    {service === 'youtube-music' && 'name' in userData && userData.name && (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="text-base">{userData.name}</span>
                        </div>
                    )}

                    {/* Extra fields (like playlist count, subscription type) */}
                    {extraFields?.map((field, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">{field.label}</span>
                            <span className="text-base font-medium">{field.value}</span>
                        </div>
                    ))}

                    {/* Logout button */}
                    <LogoutServiceButton
                        serviceName={serviceName}
                        onClick={onLogout}
                    />
                </>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                    <LoginServiceButton
                        serviceName={serviceName}
                        authUrl={authUrl}
                    />
                </>
            )}
        </div>
    )
}
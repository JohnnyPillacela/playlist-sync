// /components/service-user-info.tsx

import { GoogleUserInfo } from "@/lib/constants/google";
import { SpotifyUser } from "@/lib/constants/spotify";
import { Button } from "./ui/button";
import Link from "next/link";

interface ServiceUserInfoProps {
  service: "spotify" | "youtube-music";
  serviceName: string; // Display name e.g., "Spotify", "YouTube Music"
  userData: SpotifyUser | GoogleUserInfo | null;
  authUrl: string; // Sign-in URL when not authenticated
  onLogout: () => Promise<void>; // Logout handler
  extraFields?: { label: string; value: string | number }[]; // Optional extra data like playlist count
}

export default function ServiceUserInfo({ service, serviceName, userData, authUrl, onLogout, extraFields }: ServiceUserInfoProps) {
    return (
        <div key={service} className="flex flex-col gap-1 p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold">{serviceName}</h3>
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
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-fit mt-1 self-end text-xs px-2 py-1 h-7"
                        onClick={onLogout}
                    >
                        Log out of {serviceName}
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                    <Link href={authUrl}>
                        <Button variant="outline" size="sm" className="w-full">
                            Sign in to {serviceName}
                        </Button>
                    </Link>
                </>
            )}
        </div>
    )
}
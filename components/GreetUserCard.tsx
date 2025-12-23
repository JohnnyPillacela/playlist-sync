// /components/GreetUserCard.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface GreetUserCardProps {
    name: string;
    email: string;
    country: string;
    product: string;
    playlists: number;
}

export default function GreetUserCard({ name, email, country, product, playlists }: GreetUserCardProps) {
    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-5xl font-bold">Welcome back, {name}!</CardTitle>
            <CardDescription className="text-xl mt-2">
                Here's your playlist overview
            </CardDescription>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-base text-muted-foreground">
                {email && (
                    <span className="flex items-center">
                        {email}
                    </span>
                )}
                {country && (
                    <>
                        <span className="text-border">•</span>
                        <span>{country}</span>
                    </>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-3xl font-semibold">{product === 'premium' ? 'Premium' : 'Free'}</span>
                    <span className="text-sm text-muted-foreground mt-1">Subscription Status</span>
                </div> 
                <div className="h-12 w-px bg-border"></div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">{playlists}</span>
                    <span className="text-sm text-muted-foreground mt-1">Total Playlists</span>
                </div>

            </div>
        </CardContent>
    </Card>
    )
}
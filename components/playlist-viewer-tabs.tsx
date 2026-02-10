// components/playlist-viewer-tabs.tsx
'use client';

import PlaylistTable from './playlist-table';
import { NormalizedPlaylist, PlaylistProviderData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ListMusic, Loader2, LogIn } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { LoginServiceButton } from './login-service-button';

interface PlaylistViewerTabsProps {
  providerData: PlaylistProviderData[];
}

async function getYoutubeUserPlaylists(): Promise<NormalizedPlaylist[] | null> {
  try {
    const response = await fetch('/api/youtube/playlists');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching YouTube user playlists:', errorData);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching YouTube user playlists:', error);
    return null;
  }
}

async function getSpotifyUserPlaylists(): Promise<NormalizedPlaylist[] | null> {
  try {
    const response = await fetch('/api/spotify/playlists');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching Spotify user playlists:', errorData);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify user playlists:', error);
    return null;
  }
}

export default function PlaylistViewerTabs({
  providerData,
}: PlaylistViewerTabsProps) {
  const spotifyProvider = providerData.find(
    (provider) => provider.service === 'spotify'
  );
  const youtubeProvider = providerData.find(
    (provider) => provider.service === 'youtube-music'
  );

  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [spotifyUserPlaylists, setSpotifyUserPlaylists] = useState<
    NormalizedPlaylist[]
  >([]);
  const [youtubeUserPlaylists, setYoutubeUserPlaylists] = useState<
    NormalizedPlaylist[]
  >([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  useEffect(() => {
    async function fetchPlaylists() {
      if (spotifyProvider?.isAuthenticated) {
        setSpotifyLoading(true);
        setSpotifyError(null);

        const playlists = await getSpotifyUserPlaylists();

        if (playlists === null) {
          setSpotifyError('Failed to load Spotify playlists');
          setSpotifyUserPlaylists([]);
        } else {
          setSpotifyUserPlaylists(
            playlists.sort((a, b) => a.name.localeCompare(b.name))
          );
        }

        setSpotifyLoading(false);
      }

      if (youtubeProvider?.isAuthenticated) {
        setYoutubeLoading(true);
        setYoutubeError(null);

        const playlists = await getYoutubeUserPlaylists();

        if (playlists === null) {
          setYoutubeError('Failed to load YouTube Music playlists');
          setYoutubeUserPlaylists([]);
        } else {
          setYoutubeUserPlaylists(
            playlists.sort((a, b) => a.name.localeCompare(b.name))
          );
        }

        setYoutubeLoading(false);
      }
    }
    fetchPlaylists();
  }, [spotifyProvider?.isAuthenticated, youtubeProvider?.isAuthenticated]);

  const defaultTab = useMemo(() => {
    if (spotifyProvider?.isAuthenticated) return 'spotify';
    if (youtubeProvider?.isAuthenticated) return 'youtube-music';
    return 'spotify';
  }, [spotifyProvider?.isAuthenticated, youtubeProvider?.isAuthenticated]);

  const renderProviderSection = (
    service: 'spotify' | 'youtube-music',
    playlists: NormalizedPlaylist[],
    isLoading: boolean,
    error: string | null
  ) => {
    const provider =
      service === 'spotify' ? spotifyProvider : youtubeProvider;
    const providerName = service === 'spotify' ? 'Spotify' : 'YouTube Music';
    const authUrl =
      service === 'spotify' ? '/api/spotify/auth' : '/api/youtube/auth';

    // State 1: Not authenticated
    if (!provider?.isAuthenticated) {
      return (
        <Card key={service} className="shadow-sm w-full">
          <CardHeader>
            <CardTitle>Your {providerName} Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <LogIn className="w-16 h-16" />
                </EmptyMedia>
                <EmptyTitle>
                  Please sign in to view your {providerName} playlists
                </EmptyTitle>
              </EmptyHeader>
              {service === 'spotify' ? (
                <LoginServiceButton service="spotify" authUrl="/api/spotify/auth" />
              ) : (
                <LoginServiceButton service="youtube" authUrl="/api/youtube/auth" />
              )}
            </Empty>
          </CardContent>
        </Card>
      );
    }

    // State 2: Error occurred
    if (error) {
      return (
        <Card key={service} className="shadow-sm w-full">
          <CardHeader>
            <CardTitle>Your {providerName} Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <div className="text-red-500">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </EmptyMedia>
                <EmptyTitle>Failed to load playlists</EmptyTitle>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    // State 3: Authenticated but still loading
    if (isLoading) {
      return (
        <Card key={service} className="shadow-sm w-full">
          <CardHeader>
            <CardTitle>Your {providerName} Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // State 4: Authenticated with no playlists
    if (playlists.length === 0) {
      return (
        <Card key={service} className="shadow-sm w-full">
          <CardHeader>
            <CardTitle>Your {providerName} Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <ListMusic className="w-16 h-16" />
                </EmptyMedia>
                <EmptyTitle>You have no playlists on {providerName}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    // State 5: Authenticated with playlists
    return (
      <PlaylistTable
        key={service}
        playlists={playlists}
        provider={service}
      />
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="spotify">Spotify</TabsTrigger>
          <TabsTrigger value="youtube-music">YouTube Music</TabsTrigger>
        </TabsList>
        <TabsContent value="spotify" className="mt-4">
          {renderProviderSection(
            'spotify',
            spotifyUserPlaylists,
            spotifyLoading,
            spotifyError
          )}
        </TabsContent>
        <TabsContent value="youtube-music" className="mt-4">
          {renderProviderSection(
            'youtube-music',
            youtubeUserPlaylists,
            youtubeLoading,
            youtubeError
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

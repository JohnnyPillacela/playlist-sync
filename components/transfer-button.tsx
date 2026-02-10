// /components/transfer-button.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TransferRequest, TransferResponse } from '@/lib/transfer/TransferService';
import { Result } from '@/lib/types';

interface TransferButtonProps {
    transferRequest: TransferRequest;
}

async function transferPlaylist(transferRequest: TransferRequest): Promise<Result<TransferResponse>> {
    const { playlistId, playlistName, playlistDescription } = transferRequest;
    try {
        const response = await fetch('/api/transfer/spotify-to-youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playlistId,
                playlistName,
                playlistDescription,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Extract error message from the error object
            const errorMessage = typeof errorData === 'object' && errorData !== null && 'error' in errorData
                ? errorData.error
                : typeof errorData === 'string'
                ? errorData
                : 'Failed to transfer playlist';
            return { ok: false, error: errorMessage };
        }

        const data = await response.json();
        return { ok: true, data };
    } catch (error) {
        console.error('Error transferring playlist:', error);
        return { ok: false, error: 'Network error occurred' };
    }
}

export default function TransferButton({ 
    transferRequest,
}: TransferButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TransferResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTransfer = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const transferResult: Result<TransferResponse> = await transferPlaylist(transferRequest);

            if (!transferResult.ok) {
                const errorData = transferResult.error as string || 'Failed to transfer playlist';
                setError(errorData);
                return;
            }

            setResult(transferResult.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button 
                onClick={handleTransfer} 
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transferring...
                    </>
                ) : (
                    'To YouTube'
                )}
            </Button>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            {result && (
                <div className="space-y-2">
                    <div className="text-green-600 font-semibold">
                        Transfer Complete!
                    </div>
                    <div className="text-sm">
                        <p>Matched: {result.tracksMatched} / {result.tracksTotal}</p>
                        <p>Added: {result.tracksAdded} tracks</p>
                        <p>Duration: {(result.duration / 1000).toFixed(2)}s</p>
                        {result.playlistUrl && (
                            <a 
                                href={result.playlistUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Playlist
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
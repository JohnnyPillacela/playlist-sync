// /lib/spotify/auth.ts

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: {
        'grant_type': 'client_credentials'
    },
    json: true
};

// Overloaded function signatures
export async function _fetchTokenDetails(): Promise<any>;
export async function _fetchTokenDetails(customAuthOptions: any): Promise<any>;
export async function _fetchTokenDetails(customAuthOptions?: any): Promise<any> {
    const options = customAuthOptions || authOptions;
    
    const response = await fetch(options.url, {
        method: 'POST',
        headers: options.headers,
        body: new URLSearchParams(options.body).toString(),
    });
    const data = await response.json();
    return data;
}
// /lib/constants/google.ts

export const GOOGLE_ACCESS_TOKEN_KEY = "google_access_token";
export const GOOGLE_REFRESH_TOKEN_KEY = "google_refresh_token";

export type GoogleUserInfo = {
    id: string;
    email: string
    verified_email: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    locale?: string;
};
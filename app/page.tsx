// /app/page.tsx

import { LandingPage } from '@/components/landing-page';
import { getMessages } from '@/lib/i18n';

export default async function Home() {
  const messages = await getMessages('en', 'landing-page');
  return <LandingPage messages={messages} />;
}

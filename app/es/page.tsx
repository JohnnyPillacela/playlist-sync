// /app/es/page.tsx

import { LandingPage } from '@/components/landing-page';
import { getMessages } from '@/lib/i18n';

export default async function EsHome() {
  const messages = await getMessages('es', 'landing-page');
  return <LandingPage messages={messages} locale="es" />;
}

import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Haircut — Find the look that feels like you',
  description: 'Discover hairstyles and beard styles guided by your face shape, hair and personal style.',
  applicationName: 'Haircut',
  metadataBase: new URL('https://haircut.ai'),
  openGraph: { title: 'Haircut — Your next signature look', description: 'A more personal way to find your hairstyle.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}</body></html>;
}

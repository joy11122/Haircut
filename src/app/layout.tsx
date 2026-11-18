import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Haircut — Find the look that feels like you',
  description: 'Discover hairstyles and beard styles guided by your face shape, hair and personal style.',
  applicationName: 'Haircut',
  openGraph: { title: 'Haircut — Your next signature look', description: 'A more personal way to find your hairstyle.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><SiteHeader />{children}</Providers></body></html>;
}

import '../../src/app/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ContentSelector from '../app/components/ContentSelector';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

// Dynamically import a component, disabling server-side rendering for it
const ClockBar = dynamic(() => import('../app/components/ClockBar'), {
  ssr: false,
});

const NavigationBar = dynamic(() => import('../app/components/NavigationBar'), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isRaidPage = router.pathname.startsWith('/raids/');

  return (
    <div className="flex flex-col min-h-screen bg-primary-background-color">
      <header className="sticky top-0 z-50">
        <ClockBar />
        <NavigationBar currentPath={router.pathname} />
      </header>
      <main className="flex-grow">
        {isRaidPage && (
          <div className="min-w-full overflow-hidden">
            <ContentSelector currentPath={router.asPath} />
          </div>
        )}
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-Z3BL4HXK7M" />
        <GoogleTagManager gtmId="G-Z3BL4HXK7M" />
      </main>
    </div>
  );
}

export default MyApp;

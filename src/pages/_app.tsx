import Head from 'next/head'

import { DeviceProvider } from '@/provider/Device'
import { I18nProvider } from '@/provider/I18n'
import { QueryProvider } from '@/provider/Query'
import { ThemeProvider } from '@/provider/Theme'
import { useSettingsStore } from '@/lib/store/settings'

import type { AppProps } from 'next/app'

import '@/styles/globals.css'

function AppContent({ Component, pageProps }: AppProps) {
  const { backgroundImage } = useSettingsStore();

  return (
    <>
      <Head>
        <title>Alle</title>
      </Head>
      {backgroundImage && (
        <div 
          className="fixed inset-0 z-[-1] opacity-50 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <Component {...pageProps} />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <DeviceProvider>
          <I18nProvider>
            <AppContent {...props} />
          </I18nProvider>
        </DeviceProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

import React from 'react'
import { Plus_Jakarta_Sans, Source_Sans_3 } from 'next/font/google'
import { HierarchySearchProvider, NavigationLoadingProvider } from '@/context'
import './styles.css'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  description: 'LmsDoors - Learning Management System. Master competitive exams with comprehensive study materials, practice tests, and expert guidance.',
  title: 'LmsDoors - Exam Preparation Platform',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning className={`${sourceSans.variable} ${plusJakarta.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <main>
          <HierarchySearchProvider>
            <NavigationLoadingProvider>
              {children}
            </NavigationLoadingProvider>
          </HierarchySearchProvider>
        </main>
      </body>
    </html>
  )
}

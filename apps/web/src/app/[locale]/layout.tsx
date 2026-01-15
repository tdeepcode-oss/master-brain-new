import { AppShell } from '@/components/layout/app-shell'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Mastery Brain',
    description: 'Your second brain.',
}

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages()

    return (
        <html lang={locale}>
            <body className={`${inter.className} bg-black text-white`}>
                <NextIntlClientProvider messages={messages}>
                    <AppShell>
                        {children}
                    </AppShell>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

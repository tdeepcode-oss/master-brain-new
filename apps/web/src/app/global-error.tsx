'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global Error', error)
    }, [error])

    return (
        <html lang="en">
            <body className="bg-black text-white">
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
                    <div className="bg-red-500/10 p-4 rounded-full text-red-500 mb-6">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Critical Error</h1>
                    <p className="text-zinc-500 mb-8 max-w-lg">
                        The application encountered a critical error and cannot recover.
                    </p>
                    <Button onClick={() => reset()}>
                        Reload Application
                    </Button>
                </div>
            </body>
        </html>
    )
}

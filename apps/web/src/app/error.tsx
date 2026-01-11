'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4">
            <div className="border border-red-900 bg-red-950/30 p-8 rounded-xl max-w-lg text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong!</h2>
                <p className="text-zinc-400 mb-6">
                    We encountered an unexpected error.
                </p>

                {error.digest && (
                    <div className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-500 mb-6 break-all">
                        Error Digest: {error.digest}
                    </div>
                )}

                {/* In production, we typically don't show the full stack, 
            but for debugging this prototype we show the message if available */}
                <p className="text-sm text-red-400 mb-6 font-mono bg-black/20 p-2 rounded">
                    {error.message || 'Unknown Error'}
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    )
}

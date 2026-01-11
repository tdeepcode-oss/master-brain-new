'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log exception to error reporting service
        console.error('Global Error Exception:', error)
    }, [error])

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4 font-sans">
                    <div className="border border-red-900 bg-red-950/30 p-8 rounded-xl max-w-2xl text-center shadow-2xl">
                        <h1 className="text-3xl font-bold mb-4 text-red-500">Critical Application Error</h1>
                        <p className="text-zinc-400 mb-8 text-lg">
                            The application encountered a critical error and could not render.
                        </p>

                        {error.digest && (
                            <div className="bg-black/50 p-4 rounded text-sm font-mono text-zinc-500 mb-6 break-all border border-zinc-800">
                                <span className="text-zinc-400 select-all selection:bg-red-900">Digest: {error.digest}</span>
                            </div>
                        )}

                        <div className="text-left bg-black/40 p-4 rounded-lg mb-8 overflow-auto max-h-60 border border-red-900/30">
                            <p className="text-xs uppercase font-bold text-red-400 mb-2">Debugging Details:</p>
                            <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                                {error.message || 'No error message available.'}
                            </pre>
                            {error.stack && (
                                <pre className="text-xs font-mono text-zinc-600 mt-4 whitespace-pre-wrap border-t border-zinc-800 pt-4">
                                    {error.stack}
                                </pre>
                            )}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => reset()}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Try to Recover
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Force Reload
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}

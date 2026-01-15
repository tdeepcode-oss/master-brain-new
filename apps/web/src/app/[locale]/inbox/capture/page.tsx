'use client'

import { saveUrl } from '@/actions/resource'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CapturePage() {
    const searchParams = useSearchParams()
    const url = searchParams.get('url')
    const title = searchParams.get('title')

    const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!url) return

        const saveData = async () => {
            setStatus('SAVING')
            try {
                await saveUrl(url, title || undefined)
                setStatus('SUCCESS')
            } catch (err) {
                console.error(err)
                setStatus('ERROR')
                setError('Failed to save URL. Please try again.')
            }
        }

        saveData()
    }, [url, title])

    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
                <h1 className="text-xl font-bold mb-2">Web Clipper</h1>
                <p className="text-zinc-500 mb-4">No URL provided.</p>
                <Link href="/inbox">Go to Inbox</Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
                {status === 'SAVING' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <div>
                            <h2 className="font-semibold text-lg">Saving to Mastery Brain...</h2>
                            <p className="text-zinc-500 text-sm truncate max-w-[250px] mx-auto mt-1">{title || url}</p>
                        </div>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in-50 duration-300">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg text-white">Saved to Inbox!</h2>
                            <p className="text-zinc-500 text-sm">You can close this window now.</p>
                        </div>
                        <div className="flex gap-2 w-full mt-2">
                            <Button onClick={() => window.close()} variant="outline" className="flex-1">
                                Close
                            </Button>
                            <Link href="/inbox" className="flex-1">
                                <Button className="w-full">
                                    View
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <h2 className="font-semibold text-lg text-red-400">Error</h2>
                        <p className="text-zinc-500 text-sm">{error}</p>
                        <Button onClick={() => window.location.reload()} variant="ghost">Retry</Button>
                    </div>
                )}
            </div>
        </div>
    )
}

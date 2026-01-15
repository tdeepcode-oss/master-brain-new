import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Loading...</p>
            </div>
        </div>
    )
}

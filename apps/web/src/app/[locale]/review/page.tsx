import { getDueFlashcards } from '@/actions/flashcard'
import FlashcardPlayer from '@/components/learn/flashcard-player'
import Link from 'next/link'

export default async function ReviewPage() {
    const cards = await getDueFlashcards() // Fetch only due cards

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72 flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Review Session</h1>
                    <p className="text-zinc-400">Total {cards.length} cards due for active active recall.</p>
                </div>
                <Link href="/learn" className="text-sm text-zinc-500 hover:text-white">
                    Exit Session
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center pb-20">
                <FlashcardPlayer cards={cards} />
            </div>
        </div>
    )
}

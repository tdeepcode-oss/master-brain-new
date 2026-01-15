'use client'

import { processReview } from '@/actions/learning'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

// We receive Flashcards from Server Component to be SEO/Server friendly initially, 
// but state management is client-side for rapid review.
export function ReviewSession({ initialCards }: { initialCards: any[] }) {
    const [queue, setQueue] = useState(initialCards)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [completedCount, setCompletedCount] = useState(0)

    const currentCard = queue[currentIndex]

    // Keyboard Shortcuts
    useHotkeys('space', () => { if (!isFlipped && currentCard) setIsFlipped(true) }, [isFlipped, currentCard])
    useHotkeys('1', () => handleRate(1), { enabled: isFlipped })
    useHotkeys('2', () => handleRate(2), { enabled: isFlipped })
    useHotkeys('3', () => handleRate(3), { enabled: isFlipped })
    useHotkeys('4', () => handleRate(4), { enabled: isFlipped })

    const handleRate = (rating: 1 | 2 | 3 | 4) => {
        if (!currentCard || isPending) return

        startTransition(async () => {
            // Optimistic Update: Move to next immediately
            setCompletedCount(p => p + 1)
            setIsFlipped(false)
            setCurrentIndex(p => p + 1)

            await processReview(currentCard.id, rating)
        })
    }

    if (!currentCard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white">All caught up!</h2>
                <p className="text-zinc-500 max-w-md">
                    You've reviewed {completedCount} cards today. Good job keeping your streak alive.
                </p>
                <Link href="/brain">
                    <Button variant="outline" className="mt-4 border-white/10 hover:bg-white/5">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Brain Dashboard
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between text-sm text-zinc-500 mb-8">
                <Link href="/brain" className="hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Stop Review
                </Link>
                <div>
                    {currentIndex + 1} / {queue.length + completedCount}
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="relative perspective-1000 min-h-[400px]">
                <div
                    className={cn(
                        "relative w-full min-h-[400px] transition-all duration-500 transform-style-3d cursor-pointer",
                        isFlipped ? "rotate-y-180" : ""
                    )}
                    onClick={() => !isFlipped && setIsFlipped(true)}
                >
                    {/* Front */}
                    <Card className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center bg-zinc-900 border-white/10 shadow-2xl">
                        <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest absolute top-6">Question</span>
                        <div className="text-2xl md:text-3xl font-medium text-center text-zinc-100">
                            {currentCard.front}
                        </div>
                        <div className="absolute bottom-6 text-xs text-zinc-600 animate-pulse">
                            Press [Space] to show answer
                        </div>
                    </Card>

                    {/* Back */}
                    <Card className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col items-center justify-center bg-zinc-800 border-indigo-500/30 shadow-2xl">
                        <span className="text-xs font-mono text-indigo-400/70 uppercase tracking-widest absolute top-6">Answer</span>
                        <div className="text-xl md:text-2xl text-center text-zinc-100 prose prose-invert">
                            {currentCard.back}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Controls */}
            <div className={cn(
                "mt-8 grid grid-cols-4 gap-4 transition-all duration-300",
                isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <RatingButton
                    label="Again"
                    sub="< 1m"
                    shortcut="1"
                    color="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                    onClick={() => handleRate(1)}
                />
                <RatingButton
                    label="Hard"
                    sub="2d"
                    shortcut="2"
                    color="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20"
                    onClick={() => handleRate(2)}
                />
                <RatingButton
                    label="Good"
                    sub="4d"
                    shortcut="3"
                    color="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"
                    onClick={() => handleRate(3)}
                />
                <RatingButton
                    label="Easy"
                    sub="7d"
                    shortcut="4"
                    color="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                    onClick={() => handleRate(4)}
                />
            </div>

            {!isFlipped && (
                <div className="mt-8 flex justify-center">
                    <Button onClick={() => setIsFlipped(true)} size="lg" className="w-full max-w-xs">Show Answer</Button>
                </div>
            )}
        </div>
    )
}

function RatingButton({ label, sub, shortcut, color, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border transition-all active:scale-95",
                color
            )}
        >
            <span className="font-bold text-sm">{label}</span>
            <span className="text-xs opacity-70 mb-1">{sub}</span>
            <kbd className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono bg-black/20 rounded opacity-50">{shortcut}</kbd>
        </button>
    )
}

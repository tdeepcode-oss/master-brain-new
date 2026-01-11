'use client'

import { Flashcard, processReview } from '@/actions/flashcard'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function FlashcardPlayer({ cards: initialCards }: { cards: Flashcard[] }) {
    const [cards, setCards] = useState(initialCards)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    const currentCard = cards[currentCardIndex]

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleRate = async (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
        if (!currentCard) return

        // Submit review (optimistic)
        await processReview(currentCard.id, rating)

        if (rating === 'EASY' || rating === 'GOOD') {
            // confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
        }

        setIsFlipped(false)

        if (currentCardIndex < cards.length - 1) {
            setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200) // Small delay for animation
        } else {
            setIsFinished(true)
            confetti()
        }
    }

    if (isFinished || cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
                <p className="text-zinc-400">No more cards due for review.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                    Check again
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="mb-4 flex justify-between items-center text-xs text-zinc-500">
                <span>{currentCardIndex + 1} of {cards.length}</span>
                <span>{currentCard.lessonTitle || 'General Knowledge'}</span>
            </div>

            <div className="relative h-[400px] w-full perspective-1000">
                <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    onClick={handleFlip}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                        <span className="absolute top-6 left-6 text-xs font-bold text-zinc-600 uppercase tracking-widest">Question</span>
                        <p className="text-xl md:text-2xl font-medium text-white">{currentCard.front}</p>
                        <span className="absolute bottom-6 text-xs text-zinc-500 animate-pulse">Click to flip</span>
                    </div>

                    {/* BACK */}
                    <div
                        className="absolute inset-0 backface-hidden bg-zinc-800 border border-indigo-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <span className="absolute top-6 left-6 text-xs font-bold text-indigo-400 uppercase tracking-widest">Answer</span>
                        <p className="text-lg md:text-xl text-zinc-200">{currentCard.back}</p>
                    </div>
                </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="mt-8 flex justify-center gap-3">
                {!isFlipped ? (
                    <button
                        onClick={handleFlip}
                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-medium transition-colors border border-white/5"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-3 w-full">
                        <button onClick={() => handleRate('AGAIN')} className="py-3 bg-rose-900/40 border border-rose-800/50 text-rose-200 hover:bg-rose-900/60 rounded-lg flex flex-col items-center gap-1 transition-colors">
                            <span className="text-sm font-bold">Again</span>
                            <span className="text-[10px] opacity-60">1m</span>
                        </button>
                        <button onClick={() => handleRate('HARD')} className="py-3 bg-orange-900/40 border border-orange-800/50 text-orange-200 hover:bg-orange-900/60 rounded-lg flex flex-col items-center gap-1 transition-colors">
                            <span className="text-sm font-bold">Hard</span>
                            <span className="text-[10px] opacity-60">2d</span>
                        </button>
                        <button onClick={() => handleRate('GOOD')} className="py-3 bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 hover:bg-emerald-900/60 rounded-lg flex flex-col items-center gap-1 transition-colors">
                            <span className="text-sm font-bold">Good</span>
                            <span className="text-[10px] opacity-60">5d</span>
                        </button>
                        <button onClick={() => handleRate('EASY')} className="py-3 bg-blue-900/40 border border-blue-800/50 text-blue-200 hover:bg-blue-900/60 rounded-lg flex flex-col items-center gap-1 transition-colors">
                            <span className="text-sm font-bold">Easy</span>
                            <span className="text-[10px] opacity-60">8d</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

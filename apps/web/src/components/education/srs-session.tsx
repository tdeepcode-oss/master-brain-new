'use client'

import { processReview, ReviewItem } from '@/actions/srs'
import { CheckCircle, Clock, Repeat, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SRSSession({ reviews }: { reviews: ReviewItem[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const router = useRouter()

    const currentItem = reviews[currentIndex]

    const handleRate = async (quality: number) => {
        // Optimistic update: move to next
        await processReview(currentItem.lessonId, quality)

        if (currentIndex < reviews.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setShowAnswer(false)
        } else {
            setIsComplete(true)
            router.refresh()
        }
    }

    if (isComplete || !currentItem) {
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">All Caught Up!</h2>
                <p className="text-zinc-400">You've completed your reviews for now.</p>
                <button
                    onClick={() => router.push('/education')}
                    className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                >
                    Back to Education
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-8 text-sm text-zinc-500">
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${((currentIndex) / reviews.length) * 100}%` }}
                    />
                </div>
                <span>{currentIndex + 1} / {reviews.length}</span>
            </div>

            {/* Flashcard */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-10 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-4 left-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                    {currentItem.courseTitle}
                </div>
                <div className="absolute top-4 right-4 text-xs font-mono text-zinc-600">
                    Due: {currentItem.nextReviewDate ? new Date(currentItem.nextReviewDate).toLocaleDateString() : 'Now'}
                </div>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">{currentItem.lessonTitle}</h3>
                    <p className="text-zinc-400">Can you recall the key takeaways from this lesson?</p>
                </div>

                {!showAnswer ? (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all transform hover:scale-105"
                    >
                        Show Details
                    </button>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            <button
                                onClick={() => handleRate(0)}
                                className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-500/50"
                            >
                                <Repeat className="w-6 h-6" />
                                <span className="text-sm font-bold">Again</span>
                                <span className="text-xs opacity-50">&lt; 1 min</span>
                            </button>
                            <button
                                onClick={() => handleRate(3)}
                                className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-colors border border-transparent hover:border-yellow-500/50"
                            >
                                <Clock className="w-6 h-6" />
                                <span className="text-sm font-bold">Hard</span>
                                <span className="text-xs opacity-50">2 days</span>
                            </button>
                            <button
                                onClick={() => handleRate(4)}
                                className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-transparent hover:border-blue-500/50"
                            >
                                <ThumbsUp className="w-6 h-6" />
                                <span className="text-sm font-bold">Good</span>
                                <span className="text-xs opacity-50">4 days</span>
                            </button>
                            <button
                                onClick={() => handleRate(5)}
                                className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors border border-transparent hover:border-green-500/50"
                            >
                                <CheckCircle className="w-6 h-6" />
                                <span className="text-sm font-bold">Easy</span>
                                <span className="text-xs opacity-50">7 days</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

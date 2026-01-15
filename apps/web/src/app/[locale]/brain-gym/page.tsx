import { createFlashcard, getDueFlashcards, getFlashcardStats } from '@/actions/flashcard'
import { ReviewSession } from '@/components/learning/review-session'
import { Brain, CheckCircle, Layers, Plus, Zap } from 'lucide-react'

export default async function BrainGymPage() {
    const dueCards = await getDueFlashcards()
    const stats = await getFlashcardStats()

    async function addCard(formData: FormData) {
        'use server'
        const front = formData.get('front') as string
        const back = formData.get('back') as string
        if (front && back) await createFlashcard(front, back)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header / Stats */}
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Brain className="w-10 h-10 text-pink-500" />
                            Brain Gym
                        </h1>
                        <p className="text-zinc-500">Daily Spaced Repetition to strengthen your memory.</p>
                    </div>

                    {/* Add Card Form */}
                    <form action={addCard} className="flex gap-2 bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                        <input name="front" placeholder="Front (Question)" className="bg-transparent px-3 py-2 text-sm text-white focus:outline-none w-32 md:w-48 placeholder:text-zinc-600" required />
                        <div className="w-px bg-white/10 my-1"></div>
                        <input name="back" placeholder="Back (Answer)" className="bg-transparent px-3 py-2 text-sm text-white focus:outline-none w-32 md:w-48 placeholder:text-zinc-600" required />
                        <button className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.due}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Due Reviews</div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.learned}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Learned Items</div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Cards</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Review Area */}
            <div className="bg-black/50 border border-white/5 rounded-3xl p-8 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none" />

                {dueCards.length > 0 ? (
                    <ReviewSession dueCards={dueCards} />
                ) : (
                    <div className="text-center z-10">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Brain className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Brain is Resting</h2>
                        <p className="text-zinc-500 max-w-sm mx-auto">
                            No reviews due right now. Add some new cards or come back tomorrow!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

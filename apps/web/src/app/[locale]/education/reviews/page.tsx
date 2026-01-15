import { getDueReviews } from '@/actions/srs'
import SRSSession from '@/components/education/srs-session'
import { BrainCircuit } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
    const reviews = await getDueReviews()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Spaced Repetition</h1>
                    <p className="text-zinc-500">Optimize your long-term memory with smart reviews.</p>
                </div>
            </header>

            {reviews.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <p className="text-zinc-500">No pending reviews. Great job!</p>
                </div>
            ) : (
                <SRSSession reviews={reviews} />
            )}
        </div>
    )
}

'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// Define the steps in order
const STEPS = [
    { value: 'IDEA', label: 'Idea' },
    { value: 'RESEARCH', label: 'Research' },
    { value: 'PLANNING', label: 'Plan' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'COMPLETED', label: 'Done' }
]

export function ProjectPipeline({ status, onStatusChange }: { status: string, onStatusChange: (s: string) => void }) {
    const currentIndex = STEPS.findIndex(s => s.value === status)

    // Handle archived/on_hold which are outside the flow
    if (status === 'ARCHIVED' || status === 'ON_HOLD') {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">Project is {status.replace('_', ' ')}</span>
                <button onClick={() => onStatusChange('ACTIVE')} className="text-xs underline hover:text-white ml-auto">Reactivate</button>
            </div>
        )
    }

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex

                    return (
                        <div key={step.value} className="flex items-center group">
                            {/* Step Circle */}
                            <button
                                onClick={() => onStatusChange(step.value)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all relative z-10",
                                    isCompleted ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20" :
                                        isCurrent ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_-3px_rgba(79,70,229,0.5)]" :
                                            "bg-zinc-900 border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                                )}
                            >
                                {isCompleted ? <Check className="w-3 h-3" /> : (isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <div className="w-2 h-2 bg-zinc-700 rounded-full" />)}
                                {step.label}
                            </button>

                            {/* Connector Line */}
                            {index < STEPS.length - 1 && (
                                <div className={cn(
                                    "h-[2px] w-8 mx-1 rounded-full transition-colors",
                                    index < currentIndex ? "bg-indigo-500/30" : "bg-zinc-800"
                                )} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

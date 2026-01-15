'use client'

import { toggleLessonCompletion } from '@/actions/course'
import { cn } from '@/lib/utils'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

interface LessonCompleteButtonProps {
    lessonId: string
    isCompleted: boolean
}

export function LessonCompleteButton({
    lessonId,
    isCompleted
}: LessonCompleteButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [optimisticCompleted, toggleOptimistic] = useOptimistic(
        isCompleted,
        (state) => !state
    )

    const handleToggle = async () => {
        startTransition(async () => {
            toggleOptimistic(!optimisticCompleted)
            try {
                await toggleLessonCompletion(lessonId)
                router.refresh()
            } catch (error) {
                // Revert or show error toast
                console.error("Failed to toggle completion", error)
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm border",
                optimisticCompleted
                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/50 hover:bg-emerald-600/30"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
            )}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <CheckCircle className={cn("w-4 h-4", optimisticCompleted ? "fill-emerald-600/20" : "")} />
            )}
            {optimisticCompleted ? 'Completed' : 'Mark Complete'}
        </button>
    )
}

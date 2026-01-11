'use client'

import { Task, updateTaskStatus } from '@/actions/task'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function InboxProcessor({ inboxTasks }: { inboxTasks: Task[] }) {
    const [tasks, setTasks] = useState(inboxTasks)
    const [currentIndex, setCurrentIndex] = useState(0)
    const router = useRouter()

    const currentTask = tasks[currentIndex]

    const handleProcess = async (action: 'NEXT' | 'WAITING' | 'SOMEDAY' | 'DELETE' | 'DONE') => {
        if (!currentTask) return

        // Optimistic update
        const taskToUpdate = currentTask

        // Move to next card immediately
        if (currentIndex < tasks.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            // If last card, we are done
            setTasks(prev => prev.filter(t => t.id !== taskToUpdate.id))
            // Reset index if needed or show Done screen
        }

        if (action === 'DELETE') {
            // await deleteTask(taskToUpdate.id)
        } else {
            await updateTaskStatus(taskToUpdate.id, action as any)
        }

        router.refresh()
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-white mb-2">Inbox Zero!</h2>
                <p className="text-zinc-400">You've processed all your new items.</p>
                <button onClick={() => router.push('/tasks')} className="mt-6 text-indigo-400 hover:text-indigo-300">
                    Go to Task Board
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="mb-4 text-center text-xs text-zinc-500 uppercase tracking-widest">
                Processing {currentIndex + 1} / {tasks.length}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTask.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center mb-8"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">{currentTask.title}</h2>
                    <div className="flex gap-2 text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                        {currentTask.priority} PRIORITY
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={() => handleProcess('DELETE')} color="bg-rose-900/40 text-rose-200 border-rose-800/50">Trash (Del)</Button>
                <Button onClick={() => handleProcess('SOMEDAY')} color="bg-zinc-800 text-zinc-300 border-zinc-700">Someday (S)</Button>
                <Button onClick={() => handleProcess('WAITING')} color="bg-orange-900/40 text-orange-200 border-orange-800/50">Waiting (W)</Button>
                <Button onClick={() => handleProcess('NEXT')} color="bg-emerald-900/40 text-emerald-200 border-emerald-800/50">Next Action (D)</Button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-500 text-sm">Is it actionable? Does it take less than 2 minutes?</p>
                <div className="flex gap-4 justify-center mt-2 text-xs text-zinc-600">
                    <span>Yes → Do it!</span>
                    <span>No → Trash/Reference</span>
                </div>
            </div>
        </div>
    )
}

function Button({ children, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`py-4 rounded-xl font-medium border hover:brightness-110 transition-all active:scale-95 ${color}`}
        >
            {children}
        </button>
    )
}

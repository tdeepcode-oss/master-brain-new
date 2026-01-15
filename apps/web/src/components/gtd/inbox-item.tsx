'use client'

import { Task, deleteTask, scheduleTask, updateTask } from '@/actions/task'
import { ArrowRight, Calendar, CheckCircle2, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function InboxItem({ task }: { task: Task }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleComplete = async () => {
        await updateTask(task.id, { status: 'DONE' })
    }

    const handleDelete = async () => {
        if (!confirm('Delete this task?')) return
        setIsDeleting(true)
        await deleteTask(task.id)
        setIsDeleting(false)
    }

    const handleSchedule = async () => {
        // Quick schedule for "Tomorrow" for MVP (or open a modal in v2)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        await scheduleTask(task.id, tomorrow)
    }

    const handleMoveToNext = async () => {
        await updateTask(task.id, { status: 'NEXT' })
    }

    return (
        <div className={`group flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-900 transition-all ${isDeleting ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleComplete}
                    className="text-zinc-600 hover:text-emerald-500 transition-colors"
                >
                    <CheckCircle2 className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-zinc-200">{task.title}</span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleSchedule}
                    className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                    title="Schedule for Tomorrow"
                >
                    <Calendar className="w-4 h-4" />
                </button>
                <button
                    onClick={handleMoveToNext}
                    className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                    title="Move to Next Actions"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

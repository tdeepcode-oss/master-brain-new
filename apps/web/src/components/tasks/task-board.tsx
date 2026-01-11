'use client'

import { Task, updateTaskStatus } from '@/actions/task'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState(initialTasks)
    const router = useRouter()

    const moveTask = async (taskId: string, newStatus: Task['status']) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

        await updateTaskStatus(taskId, newStatus)
        router.refresh()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TaskColumn
                title="Inbox"
                tasks={tasks.filter(t => t.status === 'INBOX')}
                type="INBOX"
                onMove={moveTask}
            />
            <TaskColumn
                title="Next Actions"
                tasks={tasks.filter(t => t.status === 'NEXT')}
                type="NEXT"
                onMove={moveTask}
            />
            <TaskColumn
                title="Waiting"
                tasks={tasks.filter(t => t.status === 'WAITING')}
                type="WAITING"
                onMove={moveTask}
            />
            <TaskColumn
                title="Done"
                tasks={tasks.filter(t => t.status === 'DONE')}
                type="DONE"
                onMove={moveTask}
            />
        </div>
    )
}

function TaskColumn({ title, tasks, type, onMove }: { title: string, tasks: Task[], type: string, onMove: any }) {
    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-zinc-400 uppercase text-sm tracking-wider flex justify-between">
                {title}
                <span className="text-zinc-600 text-xs bg-zinc-900 px-2 py-0.5 rounded-full">{tasks.length}</span>
            </h2>
            <div className={`bg-zinc-900/50 p-3 rounded-xl border border-white/5 min-h-[300px] space-y-3 ${type === 'DONE' ? 'opacity-60' : ''}`}>
                {tasks.length === 0 && (
                    <div className="text-center text-zinc-600 text-xs py-10">Empty</div>
                )}
                {tasks.map(t => (
                    <div key={t.id} className="p-3 bg-zinc-800/50 rounded-lg border border-white/5 hover:border-white/20 hover:bg-zinc-800 transition-all cursor-pointer group group">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-zinc-200">{t.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 ${t.priority === 'HIGH' ? 'text-rose-400 bg-rose-500/10' :
                                    t.priority === 'URGENT' ? 'text-red-500 bg-red-500/10' :
                                        'text-zinc-500'
                                }`}>{t.priority}</span>
                        </div>

                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            {type !== 'NEXT' && type !== 'DONE' && (
                                <button onClick={() => onMove(t.id, 'NEXT')} className="text-[10px] bg-indigo-500/20 text-indigo-400 p-1 rounded hover:bg-indigo-500/40">
                                    → Next
                                </button>
                            )}
                            {type !== 'DONE' && (
                                <button onClick={() => onMove(t.id, 'DONE')} className="text-[10px] bg-emerald-500/20 text-emerald-400 p-1 rounded hover:bg-emerald-500/40">
                                    ✓ Done
                                </button>
                            )}
                            {type === 'DONE' && (
                                <button onClick={() => onMove(t.id, 'INBOX')} className="text-[10px] bg-zinc-500/20 text-zinc-400 p-1 rounded hover:bg-zinc-500/40">
                                    ↩ Return
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

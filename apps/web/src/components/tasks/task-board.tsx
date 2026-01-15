'use client'

import { deleteTask, Task, toggleMyDay, updateTaskStatus } from '@/actions/task'
import { ArrowRight, CheckCircle2, CornerUpLeft, Sun, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState(initialTasks)
    const router = useRouter()

    const moveTask = async (taskId: string, newStatus: Task['status']) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        await updateTaskStatus(taskId, newStatus)
        router.refresh()
    }

    const handleDelete = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return
        setTasks(prev => prev.filter(t => t.id !== taskId))
        await deleteTask(taskId)
        router.refresh()
    }

    const handleToggleMyDay = async (taskId: string, currentStatus: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? {
            ...t,
            myDayDate: currentStatus ? undefined : new Date()
        } : t))

        await toggleMyDay(taskId, !currentStatus)
        router.refresh()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TaskColumn
                title="Inbox"
                tasks={tasks.filter(t => t.status === 'INBOX')}
                type="INBOX"
                onMove={moveTask}
                onDelete={handleDelete}
                onToggleMyDay={handleToggleMyDay}
            />
            <TaskColumn
                title="Next Actions"
                tasks={tasks.filter(t => t.status === 'NEXT')}
                type="NEXT"
                onMove={moveTask}
                onDelete={handleDelete}
                onToggleMyDay={handleToggleMyDay}
            />
            <TaskColumn
                title="Waiting"
                tasks={tasks.filter(t => t.status === 'WAITING')}
                type="WAITING"
                onMove={moveTask}
                onDelete={handleDelete}
                onToggleMyDay={handleToggleMyDay}
            />
            <TaskColumn
                title="Done"
                tasks={tasks.filter(t => t.status === 'DONE')}
                type="DONE"
                onMove={moveTask}
                onDelete={handleDelete}
                onToggleMyDay={handleToggleMyDay}
            />
        </div>
    )
}

function TaskColumn({ title, tasks, type, onMove, onDelete, onToggleMyDay }: {
    title: string,
    tasks: Task[],
    type: string,
    onMove: any,
    onDelete: any,
    onToggleMyDay: any
}) {
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
                {tasks.map(t => {
                    const isMyDay = t.myDayDate && new Date(t.myDayDate).toDateString() === new Date().toDateString()

                    return (
                        <div key={t.id} className="p-3 bg-zinc-800/50 rounded-lg border border-white/5 hover:border-white/20 hover:bg-zinc-800 transition-all cursor-pointer group relative">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium text-zinc-200">{t.title}</h4>
                                <div className="flex gap-1">
                                    {isMyDay && <Sun className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 ${t.priority === 'HIGH' ? 'text-rose-400 bg-rose-500/10' :
                                            t.priority === 'URGENT' ? 'text-red-500 bg-red-500/10' :
                                                'text-zinc-500'
                                        }`}>{t.priority}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end items-center">
                                {/* My Day Toggle */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleMyDay(t.id, isMyDay); }}
                                    className={`p-1 rounded mr-auto ${isMyDay ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-500 hover:text-yellow-200 hover:bg-white/5'}`}
                                    title={isMyDay ? "Remove from My Day" : "Add to My Day"}
                                >
                                    <Sun className="w-3 h-3" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                                    className="text-[10px] bg-red-500/10 text-red-500 p-1 rounded hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                {type !== 'NEXT' && type !== 'DONE' && (
                                    <button onClick={() => onMove(t.id, 'NEXT')} className="text-[10px] bg-indigo-500/20 text-indigo-400 p-1 rounded hover:bg-indigo-500/40">
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                                {type !== 'DONE' && (
                                    <button onClick={() => onMove(t.id, 'DONE')} className="text-[10px] bg-emerald-500/20 text-emerald-400 p-1 rounded hover:bg-emerald-500/40">
                                        <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                )}
                                {type === 'DONE' && (
                                    <button onClick={() => onMove(t.id, 'INBOX')} className="text-[10px] bg-zinc-500/20 text-zinc-400 p-1 rounded hover:bg-zinc-500/40">
                                        <CornerUpLeft className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

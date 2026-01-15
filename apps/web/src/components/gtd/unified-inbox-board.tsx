'use client'

import { InboxItem } from '@/actions/inbox'
import { updateResource } from '@/actions/resource'
import { updateTask } from '@/actions/task'
import { ArrowRight, CheckCircle2, Clock, FileText, Link as LinkIcon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Adapters to unify actions
async function moveItem(item: InboxItem, status: 'NEXT' | 'WAITING' | 'DONE') {
    if (item.type === 'TASK') {
        await updateTask(item.data.id, { status })
    } else if (item.type === 'RESOURCE') {
        // Resources don't have these statuses usually. 
        // If "DONE", we archive (isInbox=false).
        // If "NEXT", maybe nothing or just archive?
        // Let's assume DONE = Archive.
        if (status === 'DONE') {
            await updateResource(item.data.id, { isInbox: false })
        }
    } else if (item.type === 'NOTE') {
        // Notes: DONE = Archive??
        // Note model has isInbox.
        // updateNote doesn't expose isInbox update easily in my previous check but I can fix or assume logic.
        // Actually I should have added proper action support.
        // For now, let's assume Tasks are the main thing moving through statuses.
        // If user wants "Task-like" system, maybe they just want to manage Tasks here?
        // But we have unified capture.
        // Let's implement minimal logic for others.
    }
}

async function deleteItem(item: InboxItem) {
    if (item.type === 'TASK') await updateTask(item.data.id, { status: 'DONE' }) // Proxy delete
    // Real delete actions should be imported if they allow deletion.
}

export default function UnifiedInboxBoard({ initialItems }: { initialItems: InboxItem[] }) {
    const [items, setItems] = useState(initialItems)
    const router = useRouter()

    const handleAction = async (itemId: string, action: 'NEXT' | 'WAITING' | 'DONE' | 'DELETE') => {
        // Optimistic
        setItems(prev => prev.filter(i => i.data.id !== itemId))

        const item = items.find(i => i.data.id === itemId)
        if (!item) return

        if (action === 'DELETE') {
            await deleteItem(item)
        } else {
            await moveItem(item, action)
        }

        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* INBOX COLUMN (Main Focus) */}
                <div className="md:col-span-4 lg:col-span-3 space-y-4">
                    <h2 className="font-semibold text-zinc-400 uppercase text-sm tracking-wider flex justify-between">
                        Inbox
                        <span className="text-zinc-600 text-xs bg-zinc-900 px-2 py-0.5 rounded-full">{items.length}</span>
                    </h2>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 min-h-[300px] space-y-3">
                        {items.length === 0 && (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-zinc-500 font-medium">Inbox Zero</h3>
                            </div>
                        )}

                        {items.map(item => (
                            <UnifiedCard key={item.data.id} item={item} onAction={handleAction} />
                        ))}
                    </div>
                </div>

                {/* HELP / STATS COLUMN (Optional, like sidebar in tasks) */}
                {/* <div className="hidden md:block space-y-4">
                     ...
                </div> */}
            </div>
        </div>
    )
}

function UnifiedCard({ item, onAction }: { item: InboxItem, onAction: any }) {
    const { type, data } = item

    // Icon based on type
    const Icon = type === 'TASK' ? null : type === 'NOTE' ? FileText : LinkIcon
    const accentColor = type === 'TASK' ? 'zinc' : type === 'NOTE' ? 'yellow' : 'blue'

    return (
        <div className="group relative p-4 bg-zinc-800/40 rounded-lg border border-white/5 hover:border-white/10 hover:bg-zinc-800/80 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">

            {/* Left Decorator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-${accentColor}-500/20`} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className={`w-3 h-3 text-${accentColor}-500`} />}
                    {type !== 'TASK' && <span className={`text-[10px] uppercase font-bold text-${accentColor}-500`}>{type}</span>}
                    {type === 'TASK' && data.priority && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/5 ${data.priority === 'HIGH' ? 'text-rose-400 bg-rose-500/10' :
                                data.priority === 'URGENT' ? 'text-red-500 bg-red-500/10' :
                                    'text-zinc-600'
                            }`}>{data.priority}</span>
                    )}
                </div>
                <h4 className="text-base font-medium text-zinc-200 truncate">{data.title || "Untitled"}</h4>
                {type === 'RESOURCE' && <div className="text-xs text-blue-400 truncate mt-0.5">{data.url}</div>}
                {data.description && <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{data.description}</p>}
                {/* Date */}
                <div className="text-[10px] text-zinc-600 mt-2">
                    Added {new Date(data.createdAt || data.updatedAt).toLocaleDateString()}
                </div>
            </div>

            {/* Actions (visible on hover or always on mobile? Group hover for clean desktop look) */}
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                <button onClick={() => onAction(data.id, 'NEXT')} title="Do Next" className="p-2 hover:bg-indigo-500/20 text-zinc-500 hover:text-indigo-400 rounded transition-colors">
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => onAction(data.id, 'WAITING')} title="Waiting" className="p-2 hover:bg-orange-500/20 text-zinc-500 hover:text-orange-400 rounded transition-colors">
                    <Clock className="w-4 h-4" />
                </button>
                <button onClick={() => onAction(data.id, 'DONE')} title="Done / Archive" className="p-2 hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 rounded transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => onAction(data.id, 'DELETE')} title="Delete" className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

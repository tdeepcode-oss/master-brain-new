'use client'

import { InboxItem } from '@/actions/inbox'
import { updateTask } from '@/actions/task'
import { CheckCircle2, FileText, Link as LinkIcon, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export function InboxList({ initialItems }: { initialItems: InboxItem[] }) {
    // For MVP, we use initialItems. Real-time updates would need more complex state or revalidation.
    // Since actions revalidatePath, basic props update works on refresh.

    // Defensive check
    const items = initialItems || []

    if (items.length === 0) {
        return (
            <div className="text-center py-20 animate-in fade-in zoom-in-50 duration-500">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 mb-6 shadow-2xl">
                    <CheckCircle2 className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-zinc-500 font-medium text-lg">All caught up</h3>
                <p className="text-zinc-600 mt-2">Your mind is clear.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {initialItems.map((item: any, index) => (
                <InboxItemCard key={item.data.id || index} item={item} />
            ))}
        </div>
    )
}

function InboxItemCard({ item }: { item: InboxItem }) {
    const [isDone, setIsDone] = useState(false)
    const { type, data } = item

    const handleComplete = async () => {
        setIsDone(true)
        if (type === 'TASK') {
            await updateTask(data.id, { status: 'DONE' })
        }
        // For Note/Resource, we don't have a "Done" status directly in this view yet.
        // Usually they are processed via the Wizard.
    }

    if (isDone) return null // Optimistic hide

    return (
        <div className="group flex items-center gap-4 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 rounded-xl transition-all cursor-default">

            {/* Icon / Action */}
            <div className="shrink-0">
                {type === 'TASK' && (
                    <button onClick={handleComplete} className="w-6 h-6 rounded-full border-2 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors" />
                )}
                {type === 'NOTE' && (
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-yellow-500/10 text-yellow-500">
                        <FileText className="w-4 h-4" />
                    </div>
                )}
                {type === 'RESOURCE' && (
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10 text-blue-500">
                        <LinkIcon className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="text-zinc-200 font-medium truncate">{data.title || 'Untitled'}</h4>
                {type === 'RESOURCE' && (
                    <a href={data.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate block">
                        {data.url}
                    </a>
                )}
                {type === 'NOTE' && (
                    <p className="text-xs text-zinc-500 truncate">Note • {new Date(data.updatedAt).toLocaleDateString()}</p>
                )}
                {type === 'TASK' && (
                    <p className="text-xs text-zinc-500">Task • Added {new Date(data.createdAt).toLocaleDateString()}</p>
                )}
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-500 hover:text-white rounded hover:bg-white/5">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

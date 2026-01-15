'use client'

import { createNote } from '@/actions/note'
import { saveUrl } from '@/actions/resource'
import { createInboxTask } from '@/actions/task'
import { cn } from '@/lib/utils'
import { FileText, Link as LinkIcon, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type CaptureType = 'TASK' | 'NOTE' | 'RESOURCE'

export function SmartCapture() {
    const [input, setInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [type, setType] = useState<CaptureType>('TASK')
    const router = useRouter()

    // Auto-detect type
    const isUrl = (text: string) => {
        return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInput(val)

        if (isUrl(val)) {
            setType('RESOURCE')
        } else if (val.length > 50 || val.includes('\n')) {
            // If it gets long, maybe suggest Note? 
            // For now, keep simple auto-detection or manual toggle.
        } else {
            // Default back to TASK if it was RESOURCE but cleared
            if (type === 'RESOURCE' && !isUrl(val)) setType('TASK')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            if (type === 'RESOURCE') {
                await saveUrl(input)
            } else if (type === 'NOTE') {
                // Create note with title = input
                await createNote(input)
            } else {
                await createInboxTask(input)
            }

            setInput('')
            setType('TASK')
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Keyboard Shortcuts
    useHotkeys('meta+enter', () => handleSubmit({ preventDefault: () => { } } as any), { enableOnFormTags: true })
    useHotkeys('n', (e) => { e.preventDefault(); setType('NOTE') }, { scopes: ['capture'] })

    return (
        <form onSubmit={handleSubmit} className="relative group w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors flex items-center gap-2">
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                ) : (
                    <div className="flex items-center gap-1">
                        {type === 'RESOURCE' && <LinkIcon className="w-5 h-5 text-blue-400" />}
                        {type === 'NOTE' && <FileText className="w-5 h-5 text-yellow-400" />}
                        {type === 'TASK' && <Plus className="w-5 h-5 text-zinc-400 group-focus-within:text-white" />}
                    </div>
                )}
            </div>

            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder={
                    type === 'RESOURCE' ? "Save link..." :
                        type === 'NOTE' ? "Write a note title..." :
                            "Capture a thought..."
                }
                className={cn(
                    "w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl",
                    isSubmitting && "opacity-50"
                )}
                autoComplete="off"
                autoFocus
            />

            {/* Manual Type Toggles (Right Side) */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-zinc-950/50 p-1 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <TypeToggle active={type === 'TASK'} onClick={() => setType('TASK')} icon={<Plus className="w-3 h-3" />} label="Task" />
                <TypeToggle active={type === 'NOTE'} onClick={() => setType('NOTE')} icon={<FileText className="w-3 h-3" />} label="Note" />
            </div>
        </form>
    )
}

function TypeToggle({ active, onClick, icon, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

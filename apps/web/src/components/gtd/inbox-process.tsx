'use client'

import { InboxItem } from '@/actions/inbox'
import { updateNote } from '@/actions/note'
import { updateResource } from '@/actions/resource'
import { updateTask } from '@/actions/task'
import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/ui/tag-input'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Calendar, Check, Clock, FileText, Link as LinkIcon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

// Extended item type for the wizard to know what it is dealing with
type ProcessingItem = InboxItem

// Simplified Project type for the prop
type ProjectSummary = { id: string; name: string }

export function InboxProcess({ items, projects }: { items: ProcessingItem[], projects: ProjectSummary[] }) {
    const [queue, setQueue] = useState(items)
    const [currentItem, setCurrentItem] = useState<ProcessingItem | null>(items[0] || null)
    const [step, setStep] = useState<'REVIEW' | 'ORGANIZE'>('REVIEW')
    const [selectedTags, setSelectedTags] = useState<any[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const router = useRouter()

    useEffect(() => {
        if (queue.length > 0) {
            const nextItem = queue[0]
            setCurrentItem(nextItem)
            // Initialize tags if item has them (checking common shape)
            // @ts-ignore
            setSelectedTags(nextItem.data.tags || [])
            setSelectedProjectId('')
        } else {
            setCurrentItem(null)
        }
        setStep('REVIEW')
    }, [queue])

    const processItem = async (action: 'DONE' | 'NEXT' | 'WAITING' | 'SOMEDAY' | 'DELETE' | 'PROJECT', updates: any = {}) => {
        if (!currentItem) return

        // Validate Project Selection
        if (action === 'PROJECT' && !selectedProjectId) {
            // If user clicked 'File to Project' but didn't select one
            // We could block here, or if updates.projectId is passed (future), use that.
            // For now, simple alert or shake?
            alert("Please select a project first.")
            return
        }

        const projectIdToUse = action === 'PROJECT' ? selectedProjectId : undefined

        // Optimistic update
        const nextQueue = queue.slice(1)
        setQueue(nextQueue)

        const { type, data } = currentItem
        const id = data.id

        try {
            if (type === 'TASK') {
                if (action === 'DELETE') {
                    await updateTask(id, { status: 'DONE' }) // Proxy
                } else if (action === 'DONE') {
                    await updateTask(id, { status: 'DONE' })
                } else {
                    await updateTask(id, {
                        status: action === 'PROJECT' ? 'NEXT' : action as any,
                        ...updates,
                        projectId: projectIdToUse,
                        tagIds: selectedTags.map(t => t.id)
                    })
                }
            } else if (type === 'NOTE') {
                if (action === 'DELETE') {
                    // await deleteNote(id) 
                } else {
                    await updateNote(id, undefined, undefined, selectedTags.map(t => t.id), projectIdToUse || 'remove')
                }
            } else if (type === 'RESOURCE') {
                if (action === 'DELETE') {
                    // await deleteResource(id)
                } else {
                    await updateResource(id, {
                        ...updates,
                        projectId: projectIdToUse,
                        isInbox: false // Mark as processed
                    })
                }
            }
        } catch (e) {
            console.error("Failed to process", e)
        }

        if (nextQueue.length === 0) {
            router.refresh()
            router.push('/inbox')
        }
    }

    // Keyboard Shortcuts
    useHotkeys('d', () => processItem('DONE'), { scopes: ['wizard'] })
    useHotkeys('n', () => processItem('NEXT'), { scopes: ['wizard'] })
    useHotkeys('w', () => processItem('WAITING'), { scopes: ['wizard'] })
    useHotkeys('backspace', () => processItem('DELETE'), { scopes: ['wizard'] })

    if (!currentItem) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-50 duration-500">
                <div className="bg-emerald-500/10 p-6 rounded-full mb-6">
                    <Check className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Inbox Zero!</h2>
                <p className="text-zinc-500 mb-8 max-w-md mx-auto">You've processed all your items. Now go do the work!</p>
                <Button onClick={() => router.push('/inbox')} variant="outline" className="border-white/10 hover:bg-white/5">
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    const { type, data } = currentItem

    return (
        <div className="max-w-xl mx-auto py-12">
            <div className="flex items-center justify-between mb-8 text-sm text-zinc-500">
                <span>Processing {items.length - queue.length + 1} of {items.length}</span>
                <span className="font-mono bg-zinc-900 px-2 py-1 rounded border border-white/5">{queue.length} left</span>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={data.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">

                        {/* Type Badge */}
                        <div className="absolute top-6 right-6">
                            {type === 'TASK' && <span className="bg-zinc-800 text-zinc-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Task</span>}
                            {type === 'NOTE' && <span className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Note</span>}
                            {type === 'RESOURCE' && <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Resource</span>}
                        </div>

                        {/* Content */}
                        <div className="mb-8 pt-2">
                            <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{data.title || "Untitled"}</h2>
                            {type === 'RESOURCE' && (
                                <a href={data.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all block mb-2">
                                    {data.url}
                                </a>
                            )}
                            {data.content && type === 'NOTE' && (
                                <div className="text-zinc-500 text-sm line-clamp-4 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                                    {data.content.replace(/<[^>]*>?/gm, '')}
                                </div>
                            )}
                            {data.description && type === 'TASK' && (
                                <p className="text-zinc-500">{data.description}</p>
                            )}
                        </div>

                        {/* Actions */}
                        {step === 'REVIEW' && (
                            <div className="space-y-4">
                                {type === 'TASK' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => processItem('NEXT')}
                                                className="h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-medium shadow-lg shadow-indigo-500/20"
                                            >
                                                Do It / Next
                                            </Button>
                                            <Button
                                                onClick={() => setStep('ORGANIZE')}
                                                variant="secondary"
                                                className="h-14 text-lg font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                                            >
                                                Organize...
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Button onClick={() => processItem('WAITING')} variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                                                <Clock className="w-4 h-4 mr-2" /> Waiting
                                            </Button>
                                            <Button onClick={() => processItem('SOMEDAY')} variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                                                <Calendar className="w-4 h-4 mr-2" /> Someday
                                            </Button>
                                            <Button onClick={() => processItem('DELETE')} variant="outline" className="border-zinc-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50">
                                                <Trash2 className="w-4 h-4 mr-2" /> Trash
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    /* Resource/Note Actions */
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => setStep('ORGANIZE')}
                                                className="h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-medium shadow-lg shadow-indigo-500/20"
                                            >
                                                File to Project
                                            </Button>
                                            <Button
                                                onClick={() => processItem('DONE')} // Archive
                                                variant="secondary"
                                                className="h-14 text-lg font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                                            >
                                                Archive
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button onClick={() => processItem('DELETE')} variant="outline" className="border-zinc-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50">
                                                <Trash2 className="w-4 h-4 mr-2" /> Trash
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {step === 'ORGANIZE' && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-200">
                                {/* Context/Tags */}
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Context</label>
                                    <TagInput initialTags={selectedTags} onTagsChange={setSelectedTags} />
                                </div>

                                {/* Project Selector */}
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Project *</label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="">Select a project...</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border-t border-white/5 pt-4 mt-8 flex justify-between">
                                    <Button variant="ghost" onClick={() => setStep('REVIEW')}>Back</Button>
                                    <Button
                                        onClick={() => processItem('PROJECT')}
                                        disabled={!selectedProjectId}
                                        className={!selectedProjectId ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        Save & Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

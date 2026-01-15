'use client'

import { AreaWithCounts, createArea, deleteArea } from '@/actions/area'
import { FileText, Folder, Layers, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AreaGrid({ initialAreas }: { initialAreas: AreaWithCounts[] }) {
    const [areas, setAreas] = useState(initialAreas)
    const [isCreating, setIsCreating] = useState(false)
    const [newAreaName, setNewAreaName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newAreaName.trim()) return

        setIsSubmitting(true)
        try {
            await createArea({ name: newAreaName, icon: 'folder', color: 'blue' }) // Defaults
            // Optimistic update could go here, but revalidatePath handling in parent/refresh is safer for IDs
            setNewAreaName('')
            setIsCreating(false)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this Area? Projects usually unlink.')) return

        // Optimistic
        setAreas(prev => prev.filter(p => p.id !== id))
        await deleteArea(id)
        router.refresh()
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Create New Card */}
                <div
                    onClick={() => setIsCreating(true)}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer min-h-[200px] ${isCreating ? 'hidden' : ''}`}
                >
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                    </div>
                    <span className="text-zinc-500 font-medium group-hover:text-zinc-300">Create New Area</span>
                </div>

                {/* Creation Form Card */}
                {isCreating && (
                    <div className="flex flex-col p-6 rounded-2xl bg-zinc-900 border border-zinc-700 min-h-[200px] animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-semibold text-white mb-4">New Area</h3>
                        <form onSubmit={handleCreate} className="flex-1 flex flex-col gap-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Area Name (e.g., Health)"
                                value={newAreaName}
                                onChange={e => setNewAreaName(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-800 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                            />
                            <div className="mt-auto flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newAreaName.trim() || isSubmitting}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Area Cards */}
                {areas.map(area => (
                    <div key={area.id} className="group relative flex flex-col p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900 hover:border-white/10 transition-all min-h-[200px]">
                        <div className="flex justify-between items-start mb-auto">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-${area.color || 'blue'}-500/20 to-transparent`}>
                                <Layers className={`w-6 h-6 text-${area.color || 'blue'}-400`} />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{area.name}</h3>

                        <div className="flex gap-4 mt-4 text-xs text-zinc-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5" />
                                {area._count.projects} Projects
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                {area._count.notes} Notes
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

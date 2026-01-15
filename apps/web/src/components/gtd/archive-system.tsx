'use client'

import { ArchivedData, deleteItemPermanently, restoreItem } from '@/actions/archive'
import { Archive, CheckSquare, Folder, RefreshCcw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ArchiveSystem({ initialData }: { initialData: ArchivedData }) {
    const [activeTab, setActiveTab] = useState<'PROJECTS' | 'TASKS'>('PROJECTS')
    const [data, setData] = useState(initialData)
    const router = useRouter()

    const handleRestore = async (type: 'PROJECT' | 'TASK', id: string) => {
        // Optimistic
        if (type === 'PROJECT') {
            setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }))
        } else {
            setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
        }

        await restoreItem(type, id)
        router.refresh()
    }

    const handleDelete = async (type: 'PROJECT' | 'TASK', id: string) => {
        if (!confirm("Delete permanently? This action cannot be undone.")) return

        if (type === 'PROJECT') {
            setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }))
        } else {
            setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
        }

        await deleteItemPermanently(type, id)
        router.refresh()
    }

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('PROJECTS')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'PROJECTS' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Archived Projects
                    <span className="ml-2 text-xs bg-zinc-900 px-2 py-0.5 rounded-full">{data.projects.length}</span>
                    {activeTab === 'PROJECTS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
                <button
                    onClick={() => setActiveTab('TASKS')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'TASKS' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Archived Tasks
                    <span className="ml-2 text-xs bg-zinc-900 px-2 py-0.5 rounded-full">{data.tasks.length}</span>
                    {activeTab === 'TASKS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {activeTab === 'PROJECTS' && (
                    <>
                        {data.projects.length === 0 && <EmptyState type="Projects" />}
                        {data.projects.map(item => (
                            <ArchiveCard
                                key={item.id}
                                title={item.name}
                                subtitle={`Archived on ${new Date(item.updatedAt).toLocaleDateString()}`}
                                icon={Folder}
                                color="blue"
                                onRestore={() => handleRestore('PROJECT', item.id)}
                                onDelete={() => handleDelete('PROJECT', item.id)}
                            />
                        ))}
                    </>
                )}

                {activeTab === 'TASKS' && (
                    <>
                        {data.tasks.length === 0 && <EmptyState type="Tasks" />}
                        {data.tasks.map(item => (
                            <ArchiveCard
                                key={item.id}
                                title={item.title}
                                subtitle={`Archived on ${new Date(item.updatedAt).toLocaleDateString()}`}
                                icon={CheckSquare}
                                color="emerald"
                                onRestore={() => handleRestore('TASK', item.id)}
                                onDelete={() => handleDelete('TASK', item.id)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

function EmptyState({ type }: { type: string }) {
    return (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4">
                <Archive className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-zinc-400 font-medium">No Archived {type}</h3>
        </div>
    )
}

function ArchiveCard({ title, subtitle, icon: Icon, color, onRestore, onDelete }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:bg-zinc-900 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/10`}>
                    <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
                <div>
                    <h4 className="font-medium text-zinc-200">{title}</h4>
                    <p className="text-xs text-zinc-500">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onRestore}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                    <RefreshCcw className="w-3 h-3" /> Restore
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Permanently"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

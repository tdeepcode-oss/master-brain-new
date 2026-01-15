import { getProject, updateProjectStatus } from '@/actions/project'
import { createResource } from '@/actions/resource'
import { createTask } from '@/actions/task'
import { InboxItem } from '@/components/gtd/inbox-item'
import { ProjectPipeline } from '@/components/projects/project-pipeline'
// I will assume Shadcn Tabs exist or I will create them if missing.
// Actually standard shadcn tabs are clean.
import { cn } from '@/lib/utils'
import * as RadixTabs from '@radix-ui/react-tabs'
import { Clock, Link as LinkIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Temporary Shadcn Tabs Wrapper for speed if not exists
const TabsRoot = RadixTabs.Root
const TabsListRoot = RadixTabs.List
const TabsTriggerRoot = RadixTabs.Trigger
const TabsContentRoot = RadixTabs.Content

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id)

    if (!project) notFound()

    // Inline Server Action for Quick Task Add
    async function addTask(formData: FormData) {
        'use server'
        formData.append('projectId', project!.id)
        await createTask(formData)
    }

    // Inline Server Action for Status Update
    async function changeStatus(newStatus: string) {
        'use server'
        await updateProjectStatus(project!.id, newStatus as any)
    }

    // Inline Server Action for Resource Add
    async function addResource(formData: FormData) {
        'use server'
        formData.append('projectId', project!.id)
        formData.append('type', 'LINK')
        await createResource(formData)
    }

    // Statistics
    const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0
    const totalTasks = project.tasks?.length || 0
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-white">{project.name}</h1>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-400">{progress}%</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Complete</div>
                    </div>
                </div>

                {/* Pipeline Stepper */}
                <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl mb-6">
                    <ProjectPipeline
                        status={project.status}
                        // @ts-ignore - Server actions passed as props need careful handling or client component wrapper.
                        // Since this is a server component, we can't pass a server action directly to a client component prop that expects a function unless we bind it or it's a client component.
                        // ProjectPipeline is 'use client'. Passing `changeStatus` (server action) is valid in Next.js.
                        onStatusChange={changeStatus}
                    />
                </div>

                <div className="flex items-center gap-4 text-zinc-500 text-sm">
                    {project.deadline && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                    <div>{totalTasks} Tasks</div>
                    <div>{project.notes?.length || 0} Notes</div>
                </div>
            </div>

            {/* Tabs */}
            <TabsRoot defaultValue="tasks" className="w-full">
                <TabsListRoot className="flex border-b border-white/10 mb-8">
                    {['overview', 'tasks', 'notes', 'resources'].map(tab => (
                        <TabsTriggerRoot
                            key={tab}
                            value={tab}
                            className={cn(
                                "px-6 py-3 text-sm font-medium border-b-2 border-transparent transition-colors hover:text-white capitalize",
                                "data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 text-zinc-500"
                            )}
                        >
                            {tab}
                        </TabsTriggerRoot>
                    ))}
                </TabsListRoot>

                {/* OVERVIEW TAB */}
                <TabsContentRoot value="overview" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4">Decision Log</h3>
                            <p className="text-zinc-500 text-sm italic mb-4">
                                Track key decisions made during this project. (Tagged #decision)
                            </p>
                            {/* Placeholder for decisions */}
                            <div className="space-y-2">
                                {(project.notes?.filter(n => n.title.includes('Decision') || n.title.includes('RFC')) || []).map(note => (
                                    <Link key={note.id} href={`/notes/${note.id}`} className="block text-sm text-indigo-400 hover:underline">
                                        • {note.title}
                                    </Link>
                                ))}
                                {(project.notes?.filter(n => n.title.includes('Decision') || n.title.includes('RFC')).length === 0) && (
                                    <div className="text-zinc-600 text-sm">No decisions logged yet.</div>
                                )}
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4">Meta</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-zinc-500">Created</span>
                                    <span className="text-zinc-300">{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="text-zinc-300">{project.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContentRoot>

                {/* TASKS TAB */}
                <TabsContentRoot value="tasks" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="max-w-3xl">
                        <form action={addTask} className="relative group mb-6">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500" />
                            <input
                                name="title"
                                type="text"
                                placeholder="Add a task..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                autoComplete="off"
                            />
                        </form>
                        <div className="space-y-2">
                            {project.tasks && project.tasks.length > 0 ? (
                                project.tasks.map(task => (
                                    // @ts-ignore
                                    <InboxItem key={task.id} task={task} />
                                ))
                            ) : (
                                <p className="text-zinc-500 text-sm text-center py-8">No tasks yet.</p>
                            )}
                        </div>
                    </div>
                </TabsContentRoot>

                {/* NOTES TAB */}
                <TabsContentRoot value="notes" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link href="/library" className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5 border-dashed rounded-xl hover:bg-zinc-800 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-3 transition-colors">
                                <Plus className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-white">New Note</span>
                        </Link>
                        {project.notes && project.notes.map(note => (
                            <Link
                                key={note.id}
                                href={`/notes/${note.id}`}
                                className="p-4 bg-zinc-900 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group"
                            >
                                <h4 className="font-semibold text-zinc-200 group-hover:text-indigo-400 mb-2 truncate">{note.title}</h4>
                                <div className="text-xs text-zinc-500">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </Link>
                        ))}
                    </div>
                </TabsContentRoot>

                {/* RESOURCES TAB */}
                <TabsContentRoot value="resources" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="max-w-3xl">
                        <form action={addResource} className="flex gap-2 mb-6">
                            <input
                                name="title"
                                type="text"
                                placeholder="Add resource URL..."
                                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            />
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                                Add
                            </button>
                        </form>

                        <div className="space-y-3">
                            {project.resources && project.resources.map(res => (
                                <a
                                    key={res.id}
                                    href={res.url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-zinc-300 group-hover:text-white">{res.title}</span>
                                    </div>
                                    <span className="text-xs text-zinc-600">{new Date(res.createdAt).toLocaleDateString()}</span>
                                </a>
                            ))}
                            {(!project.resources || project.resources.length === 0) && (
                                <div className="text-center py-12 text-zinc-500 text-sm">No resources linked.</div>
                            )}
                        </div>
                    </div>
                </TabsContentRoot>
            </TabsRoot>
        </div>
    )
}

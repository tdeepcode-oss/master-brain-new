import { createProject, getProjects } from '@/actions/project'
import { ProjectBoard } from '@/components/projects/kanban/project-board'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl z-20">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Project Hub
                        <span className="text-xs font-normal text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                            Beta
                        </span>
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Visualize and move your ideas to completion.</p>
                </div>

                <form action={createProject} className="flex gap-2 items-center">
                    {/* Inline creation for simple MVP */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <Plus className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            placeholder="New Project..."
                            className="bg-zinc-900/50 border border-zinc-800 text-sm rounded-full pl-9 pr-4 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none block w-64 transition-all hover:bg-zinc-900 placeholder:text-zinc-600 text-white"
                            required
                        />
                    </div>
                </form>
            </div>

            {/* Board Area - Fixed height, horizontal scroll */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                {/* @ts-ignore - DB types match runtime */}
                <ProjectBoard initialProjects={projects} />
            </div>
        </div>
    )
}

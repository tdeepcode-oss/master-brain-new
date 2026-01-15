'use client'

import { Project } from '@/actions/project'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Folder } from 'lucide-react'
import Link from 'next/link'

export function ProjectCard({ project }: { project: Project }) { // Using Project type from actions
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Status colors
    const statusColors = {
        'ACTIVE': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        'ON_HOLD': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        'COMPLETED': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
        'ARCHIVED': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
    }

    return (
        <Link href={`/projects/${project.id}`}>
            <div className="group relative bg-zinc-900/50 border border-white/5 rounded-xl p-5 hover:bg-zinc-900 transition-all hover:border-indigo-500/30">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                        <Folder className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full border", statusColors[project.status])}>
                        {project.status.replace('_', ' ')}
                    </span>
                </div>

                <h3 className="font-semibold text-lg text-zinc-200 group-hover:text-white mb-1">{project.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">
                    {project.deadline ? (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                    ) : 'No Deadline'}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-950 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                    <span>{progress.toFixed(0)}% Complete</span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {completedTasks}/{totalTasks}
                    </span>
                </div>
            </div>
        </Link>
    )
}

'use client'

import { Project } from '@/actions/project'
import { Card } from '@/components/ui/card'
import { Draggable } from '@hello-pangea/dnd'
import { Calendar, CheckCircle2, MoreVertical } from 'lucide-react'
import Link from 'next/link'

interface ProjectKanbanCardProps {
    project: Project
    index: number
}

export function ProjectKanbanCard({ project, index }: ProjectKanbanCardProps) {
    // Calculate progress if tasks exist
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
        <Draggable draggableId={project.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className="mb-3"
                >
                    <Link href={`/projects/${project.id}`} className="block">
                        <Card className={`p-4 bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group ${snapshot.isDragging ? 'rotate-2 shadow-2xl border-indigo-500 ring-1 ring-indigo-500' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-zinc-100 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                    {project.name}
                                </h4>
                                <button className="p-1 hover:bg-white/10 rounded text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                                {project.deadline && (
                                    <span className={`flex items-center gap-1 ${new Date(project.deadline) < new Date() ? 'text-red-400' : ''}`}>
                                        <Calendar className="w-3 h-3" />
                                        {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {completedTasks}/{totalTasks}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' :
                                            progress > 60 ? 'bg-indigo-500' :
                                                'bg-zinc-600'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </Card>
                    </Link>
                </div>
            )}
        </Draggable>
    )
}

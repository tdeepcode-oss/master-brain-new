'use client'

import { deleteResource } from '@/actions/resource'
import { Card } from '@/components/ui/card'
import { Book, ExternalLink, File, GraduationCap, Link as LinkIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function ResourceCard({ resource }: { resource: any }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (confirm('Delete this resource?')) {
            setIsDeleting(true)
            await deleteResource(resource.id)
            setIsDeleting(false)
        }
    }

    const Icons = {
        LINK: LinkIcon,
        FILE: File,
        BOOK: Book,
        COURSE: GraduationCap
    }

    const Icon = Icons[resource.type as keyof typeof Icons] || LinkIcon

    return (
        <Card className="group p-4 bg-zinc-900 border-zinc-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${resource.type === 'BOOK' ? 'bg-orange-500/10 text-orange-400' :
                            resource.type === 'COURSE' ? 'bg-blue-500/10 text-blue-400' :
                                resource.type === 'FILE' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-indigo-500/10 text-indigo-400'
                        }`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="font-medium text-zinc-200 line-clamp-2 mb-1 group-hover:text-white transition-colors">
                    {resource.title}
                </h3>

                {resource.url && (
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-500 hover:text-indigo-400 flex items-center gap-1 mt-1 truncate"
                    >
                        <ExternalLink className="w-3 h-3" />
                        {new URL(resource.url).hostname}
                    </a>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
                    {resource.type}
                </span>
                {resource.project && (
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        {resource.project.name}
                    </span>
                )}
            </div>
        </Card>
    )
}

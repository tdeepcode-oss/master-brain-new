import { getTags } from '@/actions/tag'
import { cn } from '@/lib/utils'
import { Tag as TagIcon, X } from 'lucide-react'
import Link from 'next/link'

export async function TagFilter({ currentTagId }: { currentTagId?: string }) {
    const tags = await getTags()

    if (tags.length === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-zinc-500 text-sm flex items-center gap-1">
                <TagIcon className="w-3 h-3" /> Filters:
            </span>

            {currentTagId && (
                <Link
                    href="/library"
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                    Clear Filter <X className="w-3 h-3" />
                </Link>
            )}

            {tags.map(tag => {
                const isActive = tag.id === currentTagId
                return (
                    <Link
                        key={tag.id}
                        href={isActive ? '/library' : `/library?tagId=${tag.id}`}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                            isActive
                                ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                        )}
                    >
                        {tag.name}
                    </Link>
                )
            })}
        </div>
    )
}

import { createNote, getNotes } from '@/actions/note'
import { TagFilter } from '@/components/library/tag-filter'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ tagId?: string }> }) {
    const { tagId } = await searchParams
    const notes = await getNotes(tagId)

    async function createNewNote() {
        'use server'
        const note = await createNote()
        redirect(`/notes/${note.id}`)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Library</h1>
                    <p className="text-zinc-500">Your second brain database.</p>
                </div>
                <form action={createNewNote}>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" />
                        New Note
                    </button>
                </form>
            </div>

            {/* Tags Filter */}
            <TagFilter currentTagId={tagId} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                        <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-zinc-400 font-medium">Empty Library</h3>
                        <p className="text-zinc-600 mt-2">
                            {tagId ? 'No notes found for this tag.' : 'Create your first note to get started.'}
                        </p>
                    </div>
                ) : (
                    notes.map(note => (
                        <Link
                            key={note.id}
                            href={`/notes/${note.id}`}
                            className="block p-5 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-900 hover:border-indigo-500/30 transition-all group relative flex flex-col h-full"
                        >
                            <h3 className="font-semibold text-zinc-200 group-hover:text-white truncate mb-2">
                                {note.title || 'Untitled'}
                            </h3>
                            <p className="text-sm text-zinc-500 line-clamp-3 h-12 mb-4">
                                {note.content.replace(/<[^>]*>?/gm, '') || 'No content...'}
                            </p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>

                                {/* Mini Tags */}
                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex gap-1">
                                        {note.tags.slice(0, 2).map((tag: any) => (
                                            <span key={tag.id} className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">
                                                {tag.name}
                                            </span>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span className="text-[10px] text-zinc-500">+{note.tags.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}

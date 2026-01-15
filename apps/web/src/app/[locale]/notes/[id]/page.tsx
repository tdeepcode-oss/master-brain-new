import { getNote } from '@/actions/note'; // Check if exported
import { getProjects } from '@/actions/project'
import { NoteEditor } from '@/components/notes/note-editor'
import { ArrowRight, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const note = await getNote(id)
    const projects = await getProjects()

    if (!note) {
        notFound()
    }

    return (
        <div className="pb-20">
            <NoteEditor
                id={note.id}
                initialTitle={note.title}
                initialContent={note.content}
                initialTags={note.tags}
                initialProjectId={note.projectId}
                projects={projects}
            />

            {/* Backlinks Section */}
            <div className="max-w-4xl mx-auto px-8 mt-12 pt-12 border-t border-white/5">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Linked References
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* @ts-ignore - Prisma include types might need regeneration or manual type adjustment */}
                    {note.backlinks && note.backlinks.length > 0 ? (
                        note.backlinks.map((backlink: any) => (
                            <Link
                                key={backlink.id}
                                href={`/notes/${backlink.id}`}
                                className="block p-4 bg-zinc-900/30 border border-white/5 rounded-lg hover:bg-zinc-900 hover:border-indigo-500/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-zinc-300 group-hover:text-white">{backlink.title}</span>
                                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <div className="text-xs text-zinc-600 mt-2">
                                    From {new Date(backlink.updatedAt).toLocaleDateString()}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-zinc-600 italic bg-zinc-900/20 rounded-lg border border-white/5 border-dashed">
                            No linked references yet. Link to this note from another one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

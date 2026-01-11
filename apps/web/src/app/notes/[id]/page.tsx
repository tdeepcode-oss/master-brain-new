import { getBacklinks, getNote } from '@/actions/note'
import NoteEditor from '@/components/editor/note-editor'

export default async function NotePage({ params }: { params: { id: string } }) {
    // Determine if new or existing
    // If "new", we might redirect to a generated ID or handle it.
    // Let's assume params.id is a CUID.

    let note = await getNote(params.id)
    const backlinks = await getBacklinks(params.id)

    // If note not found, but ID is valid format, maybe we render empty editor to CREATE it on first save?
    // Or we show 404.
    // For "Quick Capture", we often want to open a new ID.
    // Let's allow creating if it doesn't exist, passing a "ghost" note object.

    if (!note) {
        note = {
            id: params.id,
            title: 'Untitled Note',
            content: '', // Empty JSON
            updatedAt: new Date()
        } as any
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex justify-between items-center max-w-screen-lg mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-400">{note.title}</h1>
                    <p className="text-xs text-zinc-600">ID: {note.id}</p>
                </div>
                <span className="text-xs text-zinc-600">
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString() : 'New'}
                </span>
            </header>

            <main className="flex justify-center flex-col items-center">
                <NoteEditor note={note} backlinks={backlinks} />
            </main>
        </div>
    )
}

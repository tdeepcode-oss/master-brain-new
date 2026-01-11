'use client'

import { saveNote } from '@/actions/note'
import { EditorContent, EditorInstance, EditorRoot, JSONContent } from 'novel'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { defaultExtensions } from './extensions'

export default function NoteEditor({ note, backlinks = [] }: { note: any, backlinks?: any[] }) {
    const [saveStatus, setSaveStatus] = useState('Saved')
    const [content, setContent] = useState<JSONContent>(
        note.content ? JSON.parse(note.content) : []
    )

    const debouncedSave = useDebouncedCallback(async (json: any) => {
        setSaveStatus('Saving...')
        try {
            await saveNote(note.id, json, note.title)
            setSaveStatus('Saved')
        } catch (e) {
            setSaveStatus('Error')
        }
    }, 1000)

    const onUpdate = (editor: EditorInstance) => {
        const json = editor.getJSON()
        setContent(json)
        debouncedSave(json)
    }

    return (
        <div className="relative w-full max-w-screen-lg group">
            <div className="absolute top-0 right-0 mb-4 text-xs text-zinc-500 font-mono">
                {saveStatus}
            </div>

            <div className="min-h-[500px] border border-white/10 rounded-lg bg-black/50 overflow-hidden relative">
                <EditorRoot>
                    <EditorContent
                        initialContent={content}
                        extensions={[...defaultExtensions]}
                        className="p-10 min-h-[500px] text-white prose prose-invert max-w-none focus:outline-none"
                        onUpdate={({ editor }: { editor: EditorInstance }) => onUpdate(editor)}
                    />
                </EditorRoot>
            </div>

            {/* Backlinks Footer */}
            {backlinks.length > 0 && (
                <div className="mt-12 border-t border-white/10 pt-8">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Linked Mentions</h3>
                    <div className="space-y-2">
                        {backlinks.map((link: any) => (
                            <div key={link.id} className="text-sm text-zinc-400 hover:text-white p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                                <span className="text-zinc-600">Ref: </span>
                                [[{link.title}]]
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import { saveNote } from '@/actions/note'
import { Editor } from 'novel'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function NoteEditor({ note, backlinks = [] }: { note: any, backlinks?: any[] }) {
    const [saveStatus, setSaveStatus] = useState('Saved')

    const debouncedSave = useDebouncedCallback(async (json: any) => {
        setSaveStatus('Saving...')
        try {
            // For title: usually separate input. For MVP, maybe assume first H1?
            // Or let's just pass "Untitled" or existing title if we don't extract it.
            // We'll fix title handling in a separate component or assume note object has it.
            await saveNote(note.id, json, note.title)
            setSaveStatus('Saved')
        } catch (e) {
            setSaveStatus('Error')
        }
    }, 1000)

    return (
        <div className="relative w-full max-w-screen-lg group">
            <div className="absolute top-0 right-0 mb-4 text-xs text-zinc-500 font-mono">
                {saveStatus}
            </div>

            <div className="min-h-[500px] border border-white/10 rounded-lg bg-black/50 overflow-hidden">
                <Editor
                    defaultValue={{
                        type: 'doc',
                        content: note.content ? JSON.parse(note.content) : [],
                    }}
                    onUpdate={(editor) => {
                        debouncedSave(editor?.getJSON())
                    }}
                    disableLocalStorage={true}
                    className="p-10 min-h-[500px] text-white prose prose-invert max-w-none focus:outline-none"
                />
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

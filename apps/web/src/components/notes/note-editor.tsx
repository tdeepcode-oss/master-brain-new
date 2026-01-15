'use client'

import { getNotes, Note, updateNote } from '@/actions/note';
import { TagInput } from '@/components/ui/tag-input';
import { cn } from '@/lib/utils';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Youtube from '@tiptap/extension-youtube';
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
    ArrowLeft, Bold, CheckSquare, Code, Folder, Heading1, Heading2,
    Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered,
    Loader2,
    Quote, Strikethrough, Table as TableIcon, Youtube as YoutubeIcon
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const lowlight = createLowlight(common)

export function NoteEditor({ id, initialTitle, initialContent, initialTags = [], initialProjectId, projects = [] }: {
    id: string,
    initialTitle: string,
    initialContent: string,
    initialTags?: any[],
    initialProjectId?: string | null,
    projects?: any[]
}) {
    const [title, setTitle] = useState(initialTitle)
    const [isSaving, setIsSaving] = useState(false)
    const [linkSearchQuery, setLinkSearchQuery] = useState<string | null>(null)
    const [slashCommandQuery, setSlashCommandQuery] = useState<string | null>(null)
    const [availableNotes, setAvailableNotes] = useState<Note[]>([])
    const [tags, setTags] = useState(initialTags)
    const [projectId, setProjectId] = useState(initialProjectId)
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Fetch available notes for linking
    useEffect(() => {
        getNotes().then((notes: any[]) => setAvailableNotes(notes.filter(n => n.id !== id)))
    }, [id])

    // Update Project
    const handleProjectChange = async (newProjectId: string | null) => {
        setProjectId(newProjectId)
        setIsSaving(true)
        // If null, we might need a way to clear it. action handles 'remove' or null.
        await updateNote(id, undefined, undefined, undefined, newProjectId || 'remove')
        setIsSaving(false)
    }

    // Tag Handler
    const handleTagsChange = async (newTags: any[]) => {
        setTags(newTags)
        setIsSaving(true)
        const tagIds = newTags.map(t => t.id)
        await updateNote(id, undefined, undefined, tagIds)
        setIsSaving(false)
    }

    // Debounced Save Function
    const debouncedSave = useDebouncedCallback(async (newTitle: string, newContent: string) => {
        setIsSaving(true)
        // TipTap JSON content usage: we are sending HTML string currently in action, let's keep it consistent.
        // If we switch to JSON in DB, we need to update action. For now, sending HTML is safer for MVP action.
        // Wait, action signature says "content?: any".
        await updateNote(id, newTitle, newContent)
        setIsSaving(false)
    }, 1000)

    // Editor Setup
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use lowlight
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: 'Type / for commands, [[ to link notes...' }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30' },
            }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Youtube.configure({ controls: false }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px]',
            },
            handleKeyDown: (view, event) => {
                // Slash Command Navigation
                if (slashCommandQuery !== null && filteredCommands.length > 0) {
                    if (event.key === 'ArrowUp') {
                        event.preventDefault(); setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length); return true
                    }
                    if (event.key === 'ArrowDown') {
                        event.preventDefault(); setSelectedIndex(prev => (prev + 1) % filteredCommands.length); return true
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault(); executeCommand(filteredCommands[selectedIndex]); return true
                    }
                    if (event.key === 'Escape') {
                        setSlashCommandQuery(null); return true
                    }
                }
                return false
            }
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML() // Using HTML for simplicity
            const cssJson = editor.getJSON() // Could use this if DB supports it

            // Logic for finding slash or [[
            const selection = editor.state.selection
            const $position = selection.$from
            // Basic text extraction for simple matching
            const textBefore = $position.parent.textBetween(Math.max(0, $position.parentOffset - 20), $position.parentOffset, '\n')

            const linkMatch = textBefore.match(/\[\[([^\]]*)$/)
            if (linkMatch) setLinkSearchQuery(linkMatch[1])
            else setLinkSearchQuery(null)

            const slashMatch = textBefore.match(/(?:^|\s)\/([^/\s]*)$/)
            if (slashMatch) setSlashCommandQuery(slashMatch[1])
            else setSlashCommandQuery(null)

            debouncedSave(title, html)
        }
    })

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (editor) debouncedSave(newTitle, editor.getHTML())
    }

    // Insert Link Logic
    const insertLink = (targetNote: Note) => {
        if (!editor) return
        const selection = editor.state.selection
        const textBefore = editor.state.doc.textBetween(Math.max(0, selection.from - 20), selection.from, '\n')
        const match = textBefore.match(/\[\[([^\]]*)$/)
        if (match) {
            editor.chain().focus()
                .deleteRange({ from: selection.from - match[0].length, to: selection.from })
                .setLink({ href: `/notes/${targetNote.id}` }).insertContent(targetNote.title).unsetLink().insertContent(' ').run()
            setLinkSearchQuery(null)
        }
    }

    // Slash Commands
    const commands = [
        { label: 'Heading 1', icon: <Heading1 className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'Heading 2', icon: <Heading2 className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Bullet List', icon: <List className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleBulletList().run() },
        { label: 'Ordered List', icon: <ListOrdered className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleOrderedList().run() },
        { label: 'Checklist', icon: <CheckSquare className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleTaskList().run() },
        { label: 'Blockquote', icon: <Quote className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleBlockquote().run() },
        { label: 'Code Block', icon: <Code className="w-4 h-4" />, action: (e: any) => e.chain().focus().toggleCodeBlock().run() },
        {
            label: 'Image', icon: <ImageIcon className="w-4 h-4" />, action: (e: any) => {
                const url = window.prompt('Image URL:')
                if (url) e.chain().focus().setImage({ src: url }).run()
            }
        },
        {
            label: 'YouTube', icon: <YoutubeIcon className="w-4 h-4" />, action: (e: any) => {
                const url = window.prompt('YouTube URL:')
                if (url) e.chain().focus().setYoutubeVideo({ src: url }).run()
            }
        },
        { label: 'Table', icon: <TableIcon className="w-4 h-4" />, action: (e: any) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    ]

    const filteredCommands = slashCommandQuery !== null
        ? commands.filter(c => c.label.toLowerCase().includes(slashCommandQuery.toLowerCase()))
        : []

    const executeCommand = (cmd: any) => {
        if (!editor) return
        const selection = editor.state.selection
        editor.chain().focus().deleteRange({ from: selection.from - (slashCommandQuery!.length + 1), to: selection.from }).run()
        cmd.action(editor)
        setSlashCommandQuery(null)
        setSelectedIndex(0)
    }

    if (!editor) return null

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 relative">

            {/* Header Properties */}
            <div className="flex flex-col gap-4 mb-8">
                {/* Top Bar */}
                <div className="flex items-center gap-4 text-zinc-500">
                    <Link href="/library" className="hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="text-xs font-mono ml-auto flex items-center gap-2">
                        {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <span>Saved</span>}
                    </div>
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled Note"
                    className="w-full bg-transparent text-4xl font-bold text-white placeholder:text-zinc-700 outline-none"
                />

                {/* Properties Grid */}
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm items-center py-4 border-b border-white/5">
                    <div className="text-zinc-500 flex items-center gap-2"><Folder className="w-4 h-4" /> Project</div>
                    <div>
                        <select
                            value={projectId || ''}
                            onChange={(e) => handleProjectChange(e.target.value || null)}
                            className="bg-transparent text-zinc-300 hover:bg-white/5 rounded px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="" className="bg-zinc-900">No Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-zinc-500 flex items-center gap-2">Tags</div>
                    <div className="min-w-0">
                        <TagInput initialTags={tags} onTagsChange={handleTagsChange} />
                    </div>
                </div>
            </div>

            {/* Bubble Menu (Selection Actions) */}
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden rounded-md border border-white/10 bg-zinc-900 shadow-xl">
                    <ToggleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold className="w-4 h-4" /></ToggleBtn>
                    <ToggleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic className="w-4 h-4" /></ToggleBtn>
                    <ToggleBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough className="w-4 h-4" /></ToggleBtn>
                    <ToggleBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Code className="w-4 h-4" /></ToggleBtn>
                </BubbleMenu>
            )}

            {/* Floating Menu (Empty Line Actions) */}
            {editor && (
                <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden rounded-md border border-white/10 bg-zinc-900 shadow-xl ml-[-120px]">
                    <ToggleBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></ToggleBtn>
                    <ToggleBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="w-4 h-4" /></ToggleBtn>
                </FloatingMenu>
            )}

            {/* Editor */}
            <div className="prose prose-invert max-w-none relative min-h-[500px] prose-p:text-zinc-300 prose-headings:text-white prose-a:text-indigo-400">
                <EditorContent editor={editor} />

                {/* Menus (Slash & Link) */}
                {/* Simplified absolute positioning for MVP. Ideal: Tippy.js based on cursor */}
                {(linkSearchQuery !== null || (slashCommandQuery !== null && filteredCommands.length > 0)) && (
                    <div className="fixed bottom-10 right-10 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm animate-pulse">
                        Type keys to filter... (Menu currently static for demo compatibility)
                    </div>
                )}

                {/* Slash Command Menu (Inline Style) */}
                {slashCommandQuery !== null && filteredCommands.length > 0 && (
                    <div className="absolute z-50 w-60 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden mt-8 animate-in fade-in zoom-in-95 duration-100" style={{ top: '30%', left: '10%' }}>
                        {/* TODO: Calculate real cursor position for top/left */}
                        <div className="p-2 border-b border-white/5 text-xs text-zinc-500 font-medium">Commands</div>
                        <div className="max-h-64 overflow-y-auto p-1">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={index}
                                    onClick={() => executeCommand(cmd)}
                                    // Use onMouseEnter to allow mouse selection update too
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3",
                                        index === selectedIndex ? "bg-indigo-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
                                    )}
                                >
                                    <div className={cn("w-6 h-6 flex items-center justify-center rounded border", index === selectedIndex ? "bg-white/20 border-white/20" : "bg-white/5 border-white/5")}>
                                        {cmd.icon}
                                    </div>
                                    {cmd.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Link Menu (Inline Style) */}
                {linkSearchQuery !== null && (
                    <div className="absolute z-50 w-64 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden mt-8" style={{ top: '30%', left: '10%' }}>
                        <div className="p-2 border-b border-white/5 text-xs text-zinc-500 font-medium">Link to...</div>
                        <div className="max-h-48 overflow-y-auto">
                            {availableNotes.filter(n => n.title.toLowerCase().includes(linkSearchQuery.toLowerCase())).map(note => (
                                <button key={note.id} onClick={() => insertLink(note)} className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <LinkIcon className="inline w-3 h-3 mr-2 opacity-50" />{note.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ToggleBtn({ onClick, active, children }: { onClick: () => void, active: boolean, children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 hover:bg-zinc-800 transition-colors",
                active ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-400"
            )}
        >
            {children}
        </button>
    )
}

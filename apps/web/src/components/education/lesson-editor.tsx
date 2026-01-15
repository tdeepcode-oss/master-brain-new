'use client'

import { updateLesson } from '@/actions/course'
import { cn } from '@/lib/utils'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'
import { Check, ChevronDown, ChevronRight, FileAudio, FileImage, FileVideo, Loader2, MonitorPlay } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

// Setup syntax highlighting
const lowlight = createLowlight(common)

interface LessonEditorProps {
    lessonId: string
    initialContent: string
    initialVideoUrl?: string
    initialSlidesUrl?: string
    initialAudioUrl?: string
    initialInfographicUrl?: string
}

export function LessonEditor({
    lessonId,
    initialContent,
    initialVideoUrl,
    initialSlidesUrl,
    initialAudioUrl,
    initialInfographicUrl
}: LessonEditorProps) {
    const [media, setMedia] = useState({
        videoUrl: initialVideoUrl || '',
        slidesUrl: initialSlidesUrl || '',
        audioUrl: initialAudioUrl || '',
        infographicUrl: initialInfographicUrl || ''
    })

    // UI Toggles
    const [showMediaInputs, setShowMediaInputs] = useState(false)

    const [isSaving, startTransition] = useTransition()
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Debounced Save
    const debouncedSave = useDebouncedCallback((content: string, currentMedia: typeof media) => {
        startTransition(async () => {
            await updateLesson(lessonId, {
                content,
                videoUrl: currentMedia.videoUrl,
                slidesUrl: currentMedia.slidesUrl,
                audioUrl: currentMedia.audioUrl,
                infographicUrl: currentMedia.infographicUrl
            })
            setLastSaved(new Date())
        })
    }, 2000)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Placeholder.configure({ placeholder: 'Write your lesson content here... (Markdown supported)' }),
            Image,
            LinkExtension.configure({ openOnClick: false }),
            Youtube.configure({ controls: false }),
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px]'
            }
        },
        onUpdate: ({ editor }) => {
            debouncedSave(editor.getHTML(), media)
        }
    })

    const handleMediaChange = (field: keyof typeof media, value: string) => {
        const newMedia = { ...media, [field]: value }
        setMedia(newMedia)
        debouncedSave(editor?.getHTML() || '', newMedia)
    }

    if (!editor) return null

    return (
        <div className="space-y-8">

            {/* Media Inputs Toggle */}
            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <button
                    onClick={() => setShowMediaInputs(!showMediaInputs)}
                    className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                >
                    <div className="flex items-center gap-2 font-medium text-white">
                        <MonitorPlay className="w-5 h-5 text-indigo-400" />
                        Manage Lesson Media (Drive / YouTube)
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {isSaving ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
                            ) : lastSaved ? (
                                <><Check className="w-3 h-3 text-green-500" /> Saved</>
                            ) : null}
                        </div>
                        {showMediaInputs ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                    </div>
                </button>

                {showMediaInputs && (
                    <div className="p-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2">
                        <MediaInput
                            icon={<FileVideo className="w-4 h-4 text-red-400" />}
                            label="Video URL (YouTube / Drive)"
                            value={media.videoUrl}
                            onChange={(v: string) => handleMediaChange('videoUrl', v)}
                            placeholder="https://drive.google.com/file/d/.../view"
                        />
                        <MediaInput
                            icon={<FileAudio className="w-4 h-4 text-yellow-400" />}
                            label="Audio URL (Drive)"
                            value={media.audioUrl}
                            onChange={(v: string) => handleMediaChange('audioUrl', v)}
                            placeholder="https://drive.google.com/file/d/.../view"
                        />
                        <MediaInput
                            icon={<MonitorPlay className="w-4 h-4 text-orange-400" />}
                            label="Slides URL (Google Slides / Drive PDF)"
                            value={media.slidesUrl}
                            onChange={(v: string) => handleMediaChange('slidesUrl', v)}
                            placeholder="https://docs.google.com/presentation/d/.../edit"
                        />
                        <MediaInput
                            icon={<FileImage className="w-4 h-4 text-blue-400" />}
                            label="Infographic URL (Drive Image/PDF)"
                            value={media.infographicUrl}
                            onChange={(v: string) => handleMediaChange('infographicUrl', v)}
                            placeholder="https://drive.google.com/file/d/.../view"
                        />
                    </div>
                )}
            </div>

            {/* Media Rendering Moved to LessonMediaViewer on the page level */}

            {/* Content Editor */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between p-2 border-b border-white/5 bg-zinc-900/80 rounded-t-xl sticky top-0 z-10">
                    <div className="flex gap-1">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="B" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="I" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} label="{}" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="List" />
                    </div>
                    <div className="text-xs text-zinc-600 px-2">
                        {editor.storage.characterCount?.characters()} chars
                    </div>
                </div>
                <div className="p-8 cursor-text" onClick={() => editor.chain().focus().run()}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}

function MediaInput({ label, value, onChange, icon, placeholder }: any) {
    return (
        <div>
            <label className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1.5 ml-1">
                {icon} {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-700 font-mono"
            />
        </div>
    )
}

function ToolbarButton({ onClick, isActive, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors",
                isActive
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
            )}
        >
            {icon || label}
        </button>
    )
}

// getEmbedUrl moved to lesson-media-viewer.tsx or shared util if needed.
// For now removing locally unused function to avoid lint errors if we removed usage.
function getEmbedUrl(url: string) {
    if (!url) return ''

    // 1. YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const ytMatch = url.match(ytRegExp)
    if (ytMatch && ytMatch[2].length === 11) {
        return `https://www.youtube.com/embed/${ytMatch[2]}`
    }

    // 2. Google Drive / Docs / Slides
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        let embedUrl = url.replace(/\/view.*$/, '/preview')
        embedUrl = embedUrl.replace(/\/edit.*$/, '/preview')

        if (!embedUrl.endsWith('/preview') && !embedUrl.includes('/embed')) {
            if (!url.endsWith('/')) embedUrl += '/preview'
        }
        return embedUrl
    }
    return url
}

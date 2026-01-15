'use client'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExternalLink, FileAudio, FileImage, Maximize2, MonitorPlay } from 'lucide-react'

interface LessonMediaViewerProps {
    videoUrl?: string | null
    slidesUrl?: string | null
    audioUrl?: string | null
    infographicUrl?: string | null
}

export function LessonMediaViewer({
    videoUrl,
    slidesUrl,
    audioUrl,
    infographicUrl
}: LessonMediaViewerProps) {
    // Helper to check if we have any media besides video
    const hasAdditionalMedia = slidesUrl || audioUrl || infographicUrl

    if (!videoUrl && !hasAdditionalMedia) return null

    return (
        <div className="space-y-8 mb-8">
            {/* 1. Main Video (Hero) */}
            {videoUrl && (
                <div className="space-y-2">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                        <iframe
                            src={getEmbedUrl(videoUrl)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* 2. Additional Media Grid (Cards) */}
            {hasAdditionalMedia && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Audio Card */}
                    {audioUrl && (
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <FileAudio className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">Lesson Audio</h4>
                                    <p className="text-xs text-zinc-500">Listen to the recording</p>
                                </div>
                            </div>
                            <div className="mt-auto h-10 w-full bg-black/20 rounded overflow-hidden">
                                <iframe
                                    src={getEmbedUrl(audioUrl)}
                                    className="w-full h-full"
                                    allow="autoplay"
                                />
                            </div>
                        </div>
                    )}

                    {/* Slides Card */}
                    {slidesUrl && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="text-left bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all group">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                <MonitorPlay className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">Presentation</h4>
                                                <p className="text-xs text-zinc-500">View slides</p>
                                            </div>
                                        </div>
                                        <Maximize2 className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    {/* Mini Preview */}
                                    <div className="mt-auto w-full aspect-[16/9] bg-black/20 rounded-lg overflow-hidden border border-white/5 relative">
                                        <iframe
                                            src={getEmbedUrl(slidesUrl)}
                                            className="w-full h-full opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
                                    </div>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] bg-zinc-950 p-0 border-white/10 overflow-hidden">
                                <DialogTitle className="sr-only">Presentation Preview</DialogTitle>
                                <iframe
                                    src={getEmbedUrl(slidesUrl)}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Infographic Card */}
                    {infographicUrl && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="text-left bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all group">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <FileImage className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Infographic</h4>
                                                <p className="text-xs text-zinc-500">View visual summary</p>
                                            </div>
                                        </div>
                                        <Maximize2 className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    {/* Mini Preview */}
                                    <div className="mt-auto w-full aspect-[4/3] bg-black/20 rounded-lg overflow-hidden border border-white/5 relative">
                                        <iframe
                                            src={getEmbedUrl(infographicUrl)}
                                            className="w-full h-full opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
                                    </div>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] h-[90vh] bg-zinc-950 p-0 border-white/10 overflow-hidden flex flex-col">
                                <DialogTitle className="sr-only">Infographic Preview</DialogTitle>
                                <iframe
                                    src={getEmbedUrl(infographicUrl)}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <a
                                        href={infographicUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-black/80 hover:bg-black text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                </div>
            )}
        </div>
    )
}

// Reusing the same helper function
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

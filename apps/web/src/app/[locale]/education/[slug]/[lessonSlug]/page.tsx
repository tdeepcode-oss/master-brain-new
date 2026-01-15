import { getCourse, getLesson, getLessonProgress } from '@/actions/course'
import { LessonCompleteButton } from '@/components/education/lesson-complete-button'
import { LessonEditor } from '@/components/education/lesson-editor'
import { LessonMediaViewer } from '@/components/education/lesson-media-viewer'
import { cn } from '@/lib/utils'
import { ArrowLeft, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function LessonPage({ params }: { params: Promise<{ slug: string, lessonSlug: string }> }) {
    const { slug, lessonSlug } = await params
    // Parallel fetch for speed
    const [course, lesson, progress] = await Promise.all([
        getCourse(slug),
        getLesson(slug, lessonSlug),
        getLessonProgress((await getLesson(slug, lessonSlug))?.id || '')
    ])

    if (!course || !lesson) notFound()

    return (
        <div className="flex h-screen overflow-hidden bg-black">
            {/* Sidebar Navigation */}
            <aside className="w-80 bg-zinc-950 border-r border-white/10 flex-shrink-0 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-white/5">
                    <Link
                        href={`/education/${course.slug}`}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Course
                    </Link>
                    <h2 className="font-bold text-lg text-white line-clamp-2">{course.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {course.modules.map(module => (
                        <div key={module.id}>
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                                {module.title}
                            </h3>
                            <div className="space-y-0.5">
                                {module.lessons.map(l => {
                                    const isActive = l.slug === lesson.slug
                                    return (
                                        <Link
                                            key={l.id}
                                            href={`/education/${course.slug}/${l.slug}`}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                                isActive
                                                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <PlayCircle className={cn("w-4 h-4 flex-shrink-0", isActive ? "fill-indigo-500/20" : "")} />
                                            <span className="line-clamp-1">{l.title}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <div className="p-4 flex items-center gap-3 border-b border-white/5 lg:hidden">
                    <Link href={`/education/${course.slug}`}><ArrowLeft className="w-5 h-5 text-zinc-400" /></Link>
                    <span className="font-semibold text-white truncate">{lesson.title}</span>
                </div>

                <div className="max-w-4xl mx-auto w-full p-8 pb-32">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
                        <LessonCompleteButton
                            lessonId={lesson.id}
                            isCompleted={!!progress?.isCompleted}
                        />
                    </div>

                    <LessonMediaViewer
                        videoUrl={lesson.videoUrl}
                        slidesUrl={lesson.slidesUrl}
                        audioUrl={lesson.audioUrl}
                        infographicUrl={lesson.infographicUrl}
                    />

                    <LessonEditor
                        lessonId={lesson.id}
                        initialContent={lesson.content || ''}
                        initialVideoUrl={lesson.videoUrl || ''}
                        initialSlidesUrl={lesson.slidesUrl || ''}
                        initialAudioUrl={lesson.audioUrl || ''}
                        initialInfographicUrl={lesson.infographicUrl || ''}
                    />
                </div>
            </main>
        </div>
    )
}

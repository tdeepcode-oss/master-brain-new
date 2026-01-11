import { getLesson } from '@/actions/learn'
import Link from 'next/link'
import { notFound } from 'next/navigation'
// import { Editor } from 'novel' // We could use this for reading too, or a markdown renderer

export default async function LessonPage({ params }: { params: { slug: string, lessonSlug: string } }) {
    const data = await getLesson(params.slug, params.lessonSlug)

    if (!data) {
        notFound()
    }

    const { course, module, lesson } = data

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar for this course */}
            <aside className="fixed left-0 top-0 h-full w-72 border-r border-white/10 bg-zinc-950 p-6 hidden lg:block overflow-y-auto z-20">
                <Link href={`/learn/${course.slug}`} className="block mb-8 hover:opacity-80 transition-opacity">
                    <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider mb-1">Course</h3>
                    <p className="font-semibold text-white">{course.title}</p>
                </Link>

                <div className="space-y-6">
                    {course.modules.map(m => (
                        <div key={m.id}>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 px-2">{m.title}</h4>
                            <div className="space-y-0.5">
                                {m.lessons.map(l => (
                                    <Link
                                        key={l.id}
                                        href={`/learn/${course.slug}/lesson/${l.slug}`}
                                        className={`block px-2 py-1.5 rounded text-sm transition-colors ${l.slug === lesson.slug
                                                ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {l.order}. {l.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-8 lg:p-12 max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                        <Link href="/learn" className="hover:text-white">Library</Link>
                        <span>/</span>
                        <Link href={`/learn/${course.slug}`} className="hover:text-white">{course.title}</Link>
                        <span>/</span>
                        <span>{module.title}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    {/* Mock Content Renderer */}
                    <div className="p-8 border border-white/10 rounded-xl bg-zinc-900/30 min-h-[400px]">
                        <p className="lead">
                            This is a placeholder for the lesson content. In a real application, we would render the Markdown content here.
                        </p>
                        {lesson.content && (
                            <pre className="mt-4 p-4 bg-black rounded text-xs text-zinc-500 overflow-auto">
                                {lesson.content}
                            </pre>
                        )}
                    </div>
                </div>

                <div className="mt-12 flex justify-between border-t border-white/10 pt-8">
                    <button className="text-zinc-400 hover:text-white text-sm">← Previous Lesson</button>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-medium transition-colors">
                        Mark as Complete →
                    </button>
                </div>
            </main>
        </div>
    )
}

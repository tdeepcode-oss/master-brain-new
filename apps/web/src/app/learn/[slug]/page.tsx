import { getCourse } from '@/actions/learn'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CoursePage({ params }: { params: { slug: string } }) {
    const course = await getCourse(params.slug)

    if (!course) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <Link href="/learn" className="text-sm text-zinc-500 hover:text-white mb-6 block">← Back to Library</Link>

            <header className="mb-12 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-4">{course.title}</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">{course.description}</p>
            </header>

            <div className="max-w-3xl space-y-8">
                {course.modules.map((module) => (
                    <div key={module.id} className="border border-white/10 rounded-xl bg-zinc-900/30 overflow-hidden">
                        <div className="p-4 bg-zinc-900 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-semibold text-zinc-200">Module {module.order}: {module.title}</h3>
                            <span className="text-xs text-zinc-500">{module.lessons.length} Lessons</span>
                        </div>
                        <div>
                            {module.lessons.map((lesson) => (
                                <Link
                                    key={lesson.id}
                                    href={`/learn/${course.slug}/lesson/${lesson.slug}`}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 group-hover:border-indigo-500 group-hover:text-indigo-400">
                                            {lesson.order}
                                        </div>
                                        <span className="text-sm text-zinc-300 group-hover:text-white">{lesson.title}</span>
                                    </div>
                                    <span className="text-xs text-zinc-600 group-hover:text-zinc-400">{lesson.duration}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {course.modules.length === 0 && (
                    <div className="p-10 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500">
                        Wait for content update...
                    </div>
                )}
            </div>
        </div>
    )
}

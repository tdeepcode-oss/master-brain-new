import { createLesson, createModule, deleteCourse, deleteLesson, deleteModule, getCourse } from '@/actions/course'
import DeleteButton from '@/components/common/delete-button'
import { BookOpen, PlayCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const course = await getCourse(slug)

    if (!course) notFound()

    // Server Actions for Inline Creation
    async function addModule(formData: FormData) {
        'use server'
        const title = formData.get('title') as string
        if (title) await createModule(course!.id, title)
    }

    async function addLesson(formData: FormData) {
        'use server'
        const title = formData.get('title') as string
        const moduleId = formData.get('moduleId') as string
        if (title && moduleId) await createLesson(moduleId, title)
    }

    // Server Actions Wrappers for DeleteButton
    async function removeCourse() {
        'use server'
        await deleteCourse(course!.id)
    }

    async function removeModule(id: string) {
        'use server'
        await deleteModule(id)
    }

    async function removeLesson(id: string) {
        'use server'
        await deleteLesson(id)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-10 pb-8 border-b border-white/10">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                        <p className="text-zinc-400 max-w-2xl text-lg">{course.description || "No description."}</p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        {course.modules.length > 0 && course.modules[0].lessons.length > 0 && (
                            <Link
                                href={`/education/${course.slug}/${course.modules[0].lessons[0].slug}`}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Start Learning
                            </Link>
                        )}
                        <DeleteButton
                            onDelete={removeCourse}
                            label="Delete Course"
                            className="text-sm text-zinc-500 hover:text-red-500 flex items-center bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-red-500/10 transition-colors"
                        />
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                        Course Content
                    </h2>

                    {/* Add Module Form */}
                    <form action={addModule} className="flex gap-2">
                        <input
                            name="title"
                            type="text"
                            placeholder="New Module Title"
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            required
                        />
                        <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    {course.modules.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-white/5">
                            <p className="text-zinc-500">No modules yet. Add one to get started.</p>
                        </div>
                    ) : (
                        course.modules.map((module) => (
                            <div key={module.id} className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden group/module">
                                <div className="p-4 flex items-center justify-between bg-zinc-900/80">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-semibold text-zinc-200">{module.title}</h3>
                                        <DeleteButton
                                            onDelete={async () => { 'use server'; await deleteModule(module.id) }}
                                            iconOnly
                                            className="opacity-0 group-hover/module:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity"
                                        />
                                    </div>

                                    {/* Add Lesson Form per Module */}
                                    <form action={addLesson} className="flex items-center gap-2">
                                        <input type="hidden" name="moduleId" value={module.id} />
                                        <input
                                            name="title"
                                            type="text"
                                            placeholder="Add Lesson..."
                                            className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none w-32 focus:w-48 transition-all"
                                            required
                                        />
                                        <button className="text-zinc-500 hover:text-indigo-400">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {module.lessons.map(lesson => (
                                        <div key={lesson.id} className="group flex items-center pr-4 hover:bg-white/5 transition-colors">
                                            <Link
                                                href={`/education/${course.slug}/${lesson.slug}`}
                                                className="flex-1 flex items-center gap-3 p-4"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-600 text-xs font-mono group-hover:border-indigo-500/30 group-hover:text-indigo-400">
                                                    {lesson.order + 1}
                                                </div>
                                                <span className="text-zinc-400 group-hover:text-white transition-colors">{lesson.title}</span>
                                            </Link>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteButton
                                                    onDelete={async () => { 'use server'; await deleteLesson(lesson.id) }}
                                                    iconOnly
                                                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {module.lessons.length === 0 && (
                                        <div className="p-4 text-xs text-zinc-600 italic pl-14">
                                            No lessons in this module.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}


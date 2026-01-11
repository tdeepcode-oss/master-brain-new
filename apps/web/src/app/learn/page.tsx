import { getCourses } from '@/actions/learn'
import Link from 'next/link'

export default async function LearnPage() {
    const courses = await getCourses()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Library</h1>
                <p className="text-zinc-400">Master new skills with scientific precision.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <Link href={`/learn/${course.slug}`} key={course.id} className="group block bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                        <div className="aspect-video w-full bg-zinc-800 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-zinc-100 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                            <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{course.description}</p>

                            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                                <span>{course.modules.length} Modules</span>
                                <span>•</span>
                                <span>Start Learning →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

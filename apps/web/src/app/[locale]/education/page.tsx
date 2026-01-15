import { createCourse, getCourses } from '@/actions/course'
import { CourseCard } from '@/components/education/course-card'
import { Plus } from 'lucide-react'

export default async function EducationPage() {
    const courses = await getCourses()

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Education Hub</h1>
                    <p className="text-zinc-500">Expand your knowledge with structured courses.</p>
                </div>

                <form action={createCourse} className="flex gap-2">
                    <input
                        type="text"
                        name="title"
                        placeholder="New Course Title"
                        className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                        required
                    />
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                        <h3 className="text-zinc-400 font-medium">No Courses Yet</h3>
                        <p className="text-zinc-600 mt-2">Start your learning journey by creating a course.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

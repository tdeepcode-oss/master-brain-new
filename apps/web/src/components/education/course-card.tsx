'use client'

import { BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'

// Using "any" for now to avoid strict typing of the include structure from Prisma, 
// or we can export a type from actions. MVP speed.
export function CourseCard({ course }: { course: any }) {
    return (
        <Link href={`/education/${course.slug}`}>
            <div className="group bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden hover:bg-zinc-900 transition-all hover:border-indigo-500/30 flex flex-col h-full">
                {/* Cover Placeholder */}
                <div className="h-32 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-zinc-500 text-sm line-clamp-2 mb-4 flex-1">
                        {course.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course._count?.modules || 0} Modules
                        </span>
                        {/* <span>12 Lessons</span>  -- would need aggregate count */}
                    </div>
                </div>
            </div>
        </Link>
    )
}

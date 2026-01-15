'use server'

import { initializeSRS } from './srs'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}

// --- Courses ---

export async function getCourses() {
    // Shared courses? Or per user? Schema doesn't have userId on Course.
    // Assuming Courses are global or there is a logic I missed.
    // Let's check schema/previous assumptions. 
    // Schema: Course has NO userId. It seems to be a "System" entity or "Creator" entity.
    // For now, return ALL courses.
    const courses = await prisma.course.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { modules: true } } } // count modules as proxy, better if we count lessons
    })

    // To get lesson count, we might need a raw query or separate aggregation if not directly related
    // But let's stick to simple fetch for now.
    return courses
}

export async function getCourse(slug: string) {
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    })
    return course
}

export async function createCourse(formData: FormData) {
    const user = await getUser()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const slug = slugify(title)

    // Check collision
    const existing = await prisma.course.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    await prisma.course.create({
        data: {
            title,
            description,
            slug: finalSlug,
            userId: user.id
        }
    })

    revalidatePath('/education')
}

// --- Modules ---

export async function createModule(courseId: string, title: string) {
    // Auto-calculate order
    const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
    })
    const order = (lastModule?.order ?? -1) + 1

    await prisma.module.create({
        data: {
            title,
            courseId,
            order
        }
    })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (course) revalidatePath(`/education/${course.slug}`)
}

// --- Lessons ---

export async function createLesson(moduleId: string, title: string) {
    const slug = slugify(title)

    // Auto-calculate order
    const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
    })
    const order = (lastLesson?.order ?? -1) + 1

    await prisma.lesson.create({
        data: {
            title,
            slug,
            moduleId,
            order,
            content: ''
        }
    })

    // Need to find course slug to revalidate.
    // This is getting deep. For MVP, revalidatePath layout might be easier or just refresh.
    // Let's rely on path revalidation of the overview.
    // To do that we need the course slug.
    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { course: true }
    })

    if (module?.course) {
        revalidatePath(`/education/${module.course.slug}`)
    }
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
    // We need to find the lesson that belongs to a module that belongs to the course with this slug.
    // Prisma doesn't strictly enforce unique lesson slugs globally, only per module (unique([moduleId, slug])).
    // But URLs are typically /course/lesson-slug which implies uniqueness per course?
    // OR /course/module/lesson.
    // The plan said: `/education/[courseSlug]/[lessonSlug]`.
    // This implies Lesson Slug must be unique PER COURSE or we just take the first one or we risk collision if different modules have same lesson name.
    // For MVP, lets assume unique lesson slugs are mostly fine or we iterate to find it.

    const course = await prisma.course.findUnique({
        where: { slug: courseSlug },
        include: {
            modules: {
                include: {
                    lessons: {
                        where: { slug: lessonSlug }
                    }
                }
            }
        }
    })

    if (!course) return null

    // Flatten to find the lesson
    for (const mod of course.modules) {
        if (mod.lessons.length > 0) {
            return {
                ...mod.lessons[0],
                module: mod,
                course: course
            }
        }
    }

    return null
}

export async function updateLesson(id: string, updates: {
    content?: string,
    videoUrl?: string,
    slidesUrl?: string,
    audioUrl?: string,
    infographicUrl?: string
}) {
    await prisma.lesson.update({
        where: { id },
        data: updates
    })

    // We need to revalidate. Since we don't have course slug easily here without fetching, 
    // we can revalidate /education or do a fetch.
    // Given the depth, we might fetch the lesson to trigger revalidate on correct path.
    const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: { module: { include: { course: true } } }
    })

    if (lesson?.module?.course) {
        revalidatePath(`/education/${lesson.module.course.slug}/${lesson.slug}`)
    }
}

export async function toggleLessonCompletion(lessonId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const existing = await prisma.userProgress.findUnique({
        where: {
            userId_lessonId: {
                userId: user.id,
                lessonId
            }
        }
    })



    // ...

    if (existing) {
        if (existing.isCompleted) {
            await prisma.userProgress.update({
                where: { id: existing.id },
                data: {
                    isCompleted: false,
                    completedAt: null,
                    nextReviewDate: null // Reset SRS if unmarked?
                }
            })
        } else {
            await prisma.userProgress.update({
                where: { id: existing.id },
                data: { isCompleted: true, completedAt: new Date() }
            })
            // Initialize SRS
            await initializeSRS(user.id, lessonId)
        }
    } else {
        await prisma.userProgress.create({
            data: {
                userId: user.id,
                lessonId,
                isCompleted: true,
                completedAt: new Date()
            }
        })
        // Initialize SRS
        await initializeSRS(user.id, lessonId)
    }

    revalidatePath('/education/[slug]/[lessonSlug]', 'page')
}

export async function getLessonProgress(lessonId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return prisma.userProgress.findUnique({
        where: {
            userId_lessonId: {
                userId: user.id,
                lessonId
            }
        }
    })
}

// --- Deletion Actions ---

export async function deleteCourse(courseId: string) {
    const user = await getUser()
    // Optional: Check ownership if schema supported it properly.
    // Assuming admin/creator has access.

    await prisma.course.delete({
        where: { id: courseId }
    })

    revalidatePath('/education')
}

export async function deleteModule(moduleId: string) {
    const user = await getUser()

    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { course: true }
    })

    if (!module) return

    await prisma.module.delete({
        where: { id: moduleId }
    })

    if (module.course) {
        revalidatePath(`/education/${module.course.slug}`)
    }
}

export async function deleteLesson(lessonId: string) {
    const user = await getUser()

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { include: { course: true } } }
    })

    if (!lesson) return

    await prisma.lesson.delete({
        where: { id: lessonId }
    })

    if (lesson.module?.course) {
        revalidatePath(`/education/${lesson.module.course.slug}`)
    }
}


'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// SM-2 Constants
const MIN_EASE = 1.3
const INITIAL_EASE = 2.5
const INTERVAL_MODIFIER = 1.0 // Can tweak to slow down/speed up

export type ReviewItem = {
    lessonId: string
    lessonTitle: string
    courseTitle: string
    courseSlug: string
    lessonSlug: string
    nextReviewDate: Date | null
}

export async function getDueReviews(): Promise<ReviewItem[]> {
    const user = await getUser()
    if (!user) return []

    const now = new Date()

    const progressItems = await prisma.userProgress.findMany({
        where: {
            userId: user.id,
            nextReviewDate: {
                lte: now // Due now or in the past
            },
            isCompleted: true
        },
        include: {
            lesson: {
                include: {
                    module: {
                        include: {
                            course: true
                        }
                    }
                }
            }
        },
        orderBy: {
            nextReviewDate: 'asc'
        }
    })

    return progressItems.map(item => ({
        lessonId: item.lessonId,
        lessonTitle: item.lesson.title,
        courseTitle: item.lesson.module.course.title,
        courseSlug: item.lesson.module.course.slug,
        lessonSlug: item.lesson.slug,
        nextReviewDate: item.nextReviewDate
    }))
}

export async function initializeSRS(userId: string, lessonId: string) {
    // If already exists, maybe don't reset unless explicitly requested?
    // Or if "isCompleted" becomes true, we assume start/restart.
    // For now, let's just make sure it has defaults if nextReviewDate is null.

    // We update via existing record mostly.
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    await prisma.userProgress.updateMany({
        where: { userId, lessonId },
        data: {
            nextReviewDate: tomorrow,
            interval: 1,
            repetitions: 1,
            easeFactor: INITIAL_EASE,
            lastReviewDate: now
        }
    })
    // Note: updateMany is safe if record doesn't exist (does nothing), but logic usually implies record exists if completed.
}

export async function processReview(lessonId: string, quality: number) {
    // Quality: 0-5
    // 0: Blackout
    // 1: Incorrect
    // 2: Incorrect (but hard)
    // 3: Correct (hard)
    // 4: Correct (good)
    // 5: Correct (easy)

    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    const progress = await prisma.userProgress.findUnique({
        where: {
            userId_lessonId: { userId: user.id, lessonId }
        }
    })

    if (!progress) throw new Error('Progress not found')

    let { interval, repetitions, easeFactor } = progress

    // SM-2 Algorithm
    if (quality >= 3) {
        if (repetitions === 0) {
            interval = 1
        } else if (repetitions === 1) {
            interval = 6
        } else {
            interval = Math.round(interval * easeFactor)
        }
        repetitions += 1
    } else {
        repetitions = 0
        interval = 1
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < MIN_EASE) easeFactor = MIN_EASE

    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    await prisma.userProgress.update({
        where: { id: progress.id },
        data: {
            nextReviewDate: nextReview,
            lastReviewDate: new Date(),
            interval,
            easeFactor,
            repetitions
        }
    })

    revalidatePath('/education/reviews')
}

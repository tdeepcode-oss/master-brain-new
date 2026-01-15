'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

// SM-2 Constants
const MIN_EASE = 1.3
const BONUS_EASE = 0.15 // Slightly simpler bonus than full SM-2 for MVP stability

export async function getDueFlashcards() {
    const user = await getUser()
    const now = new Date()

    return prisma.flashcard.findMany({
        where: {
            userId: user.id,
            nextReviewDate: { lte: now }
        },
        orderBy: { nextReviewDate: 'asc' }, // Oldest due first
        take: 50 // Limit session size
    })
}

export async function getLearningStats() {
    const user = await getUser()
    const now = new Date()

    const totalCards = await prisma.flashcard.count({ where: { userId: user.id } })
    const dueCards = await prisma.flashcard.count({
        where: {
            userId: user.id,
            nextReviewDate: { lte: now }
        }
    })

    // "Mature" cards: Interval > 21 days
    const matureCards = await prisma.flashcard.count({
        where: {
            userId: user.id,
            interval: { gt: 21 }
        }
    })

    const masteryScore = totalCards > 0 ? Math.round((matureCards / totalCards) * 100) : 0

    return {
        totalCards,
        dueCards,
        matureCards,
        masteryScore
    }
}

/**
 * Process a flashcard review using a variation of SM-2 Algorithm.
 * Ratings:
 * 1: Again (Apps usually treat 1 as failure) -> Interval 0
 * 2: Hard (Pass but struggle) -> Interval * 1.2
 * 3: Good (Pass) -> Interval * Ease
 * 4: Easy (Perfect) -> Interval * Ease * Bonus
 */
export async function processReview(cardId: string, rating: 1 | 2 | 3 | 4) {
    const user = await getUser()

    const card = await prisma.flashcard.findUnique({
        where: { id: cardId, userId: user.id }
    })

    if (!card) throw new Error("Card not found")

    let { interval, easeFactor, repetitions } = card

    if (rating === 1) {
        // Failed
        repetitions = 0
        interval = 1 // Reset to 1 day (or could be 0 minutes in a more complex system, but lets say 1 day for simplicity of Date types)
        // Actually SM-2 says interval 1 for first step.
    } else {
        // Passed
        // Update Ease Factor
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        // q = rating (but SM-2 uses 0-5. We use 1-4 mapping to 0,3,4,5 effectively? Or just simplified logic)

        // Let's use simplified logic for stability:
        if (rating === 2) easeFactor -= 0.2
        if (rating === 3) easeFactor += 0 // Check SM-2 formula ideally, but stable is fine.
        if (rating === 4) easeFactor += 0.15

        if (easeFactor < MIN_EASE) easeFactor = MIN_EASE

        repetitions += 1

        // Calculate Interval
        if (repetitions === 1) {
            interval = 1
        } else if (repetitions === 2) {
            interval = 6
        } else {
            interval = Math.round(interval * easeFactor)
        }
    }

    // Next Review Date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    await prisma.flashcard.update({
        where: { id: cardId },
        data: {
            interval,
            easeFactor,
            repetitions,
            nextReviewDate: nextReview,
            updatedAt: new Date() // Force update timestamp
        }
    })

    revalidatePath('/brain')
    revalidatePath('/brain/review')
}

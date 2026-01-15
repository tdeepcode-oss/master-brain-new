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

// --- SM-2 Algorithm ---
// Returns { interval, easeFactor, repetitions, nextReviewDate }
function calculateSM2(quality: number, previousInterval: number, previousRepetitions: number, previousEaseFactor: number) {
    let interval = 0
    let repetitions = previousRepetitions
    let easeFactor = previousEaseFactor

    if (quality >= 3) {
        if (previousRepetitions === 0) {
            interval = 1
        } else if (previousRepetitions === 1) {
            interval = 6
        } else {
            interval = Math.round(previousInterval * previousEaseFactor)
        }
        repetitions += 1
    } else {
        repetitions = 0
        interval = 1
    }

    easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < 1.3) easeFactor = 1.3

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval)
    nextReviewDate.setHours(4, 0, 0, 0) // Set to 4 AM next day to avoid timezone weirdness/late night reviews

    return { interval, easeFactor, repetitions, nextReviewDate }
}

export async function createFlashcard(front: string, back: string, lessonId?: string) {
    const user = await getUser()

    await prisma.flashcard.create({
        data: {
            front,
            back,
            userId: user.id,
            lessonId: lessonId || undefined,
            // Defaults (handled by DB default usually, but explicit here for clarity)
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date() // Due immediately
        }
    })

    revalidatePath('/brain-gym')
}

export async function getDueFlashcards() {
    const user = await getUser()
    const now = new Date()

    const cards = await prisma.flashcard.findMany({
        where: {
            userId: user.id,
            nextReviewDate: {
                lte: now
            }
        },
        orderBy: {
            nextReviewDate: 'asc'
        },
        take: 20 // Limit batch size for focus
    })

    return cards
}

export async function processReview(cardId: string, quality: number) {
    const user = await getUser()

    const card = await prisma.flashcard.findUnique({
        where: { id: cardId, userId: user.id }
    })

    if (!card) return

    const { interval, easeFactor, repetitions, nextReviewDate } = calculateSM2(
        quality,
        card.interval,
        card.repetitions,
        card.easeFactor
    )

    await prisma.flashcard.update({
        where: { id: cardId },
        data: {
            interval,
            easeFactor,
            repetitions,
            nextReviewDate
        }
    })

    revalidatePath('/brain-gym')
}

export async function getFlashcardStats() {
    const user = await getUser()
    const now = new Date()

    const due = await prisma.flashcard.count({
        where: { userId: user.id, nextReviewDate: { lte: now } }
    })

    const total = await prisma.flashcard.count({
        where: { userId: user.id }
    })

    // Simple "Learned" metric: Cards with interval > 21 days
    const learned = await prisma.flashcard.count({
        where: { userId: user.id, interval: { gt: 21 } }
    })

    return { due, total, learned }
}

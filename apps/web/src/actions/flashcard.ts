'use server'

import { revalidatePath } from 'next/cache'

export type Flashcard = {
    id: string
    front: string
    back: string
    lessonTitle?: string
    nextReviewDate: Date
    interval: number
    easeFactor: number
    repetitions: number
}

// Mock Data
let mockCards: Flashcard[] = [
    {
        id: 'f1',
        front: 'What is the primary difference between Vertical and Horizontal Scaling?',
        back: 'Vertical scaling adds power to an existing machine (CPU/RAM), while horizontal scaling adds more machines to the pool.',
        lessonTitle: 'Vertical vs Horizontal Scaling',
        nextReviewDate: new Date(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0
    },
    {
        id: 'f2',
        front: 'What is Sharding?',
        back: 'Sharding is a type of database partitioning that separates very large databases the into smaller, faster, more easily managed parts called data shards.',
        lessonTitle: 'Sharding vs Partitioning',
        nextReviewDate: new Date(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0
    },
    {
        id: 'f3',
        front: 'Explain the CAP Theorem.',
        back: 'It states that a distributed data store can only provide two of the following three guarantees: Consistency, Availability, Partition Tolerance.',
        nextReviewDate: new Date(Date.now() + 86400000), // Tomorrow (not due)
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1
    }
]

export async function getDueFlashcards() {
    await new Promise(resolve => setTimeout(resolve, 500))
    const now = new Date()
    return mockCards.filter(card => card.nextReviewDate <= now)
}

export async function processReview(cardId: string, rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') {
    await new Promise(resolve => setTimeout(resolve, 300))

    const cardIndex = mockCards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return

    const card = mockCards[cardIndex]

    // Simplified SM-2 Algorithm approximation for Mock
    let nextInterval = 1
    if (rating === 'AGAIN') {
        nextInterval = 0 // Reset
        card.repetitions = 0
    } else if (rating === 'HARD') {
        nextInterval = card.interval * 1.2
        if (nextInterval < 1) nextInterval = 1
    } else if (rating === 'GOOD') {
        nextInterval = (card.interval === 0 ? 1 : card.interval) * 2.5
    } else if (rating === 'EASY') {
        nextInterval = (card.interval === 0 ? 1 : card.interval) * 1.3 * 2.5 // Boost
    }

    card.interval = Math.round(nextInterval)
    card.nextReviewDate = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000)
    card.repetitions += 1

    // Update mock array
    mockCards[cardIndex] = card

    revalidatePath('/review')
    return { success: true }
}

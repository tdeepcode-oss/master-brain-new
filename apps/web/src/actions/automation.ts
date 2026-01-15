'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function processRecurringTasks() {
    const user = await getUser()

    //Logic: Find "DONE" tasks that are recurring.
    // Ideally this logic should check if a NEW instance already exists to avoid duplicates.
    // For MVP/Demo: We will just reset the status of done recurring tasks to INBOX or Create a new one.
    // GTD Pattern: "Completion" creates the "Next Occurrence".

    const completedRecurring = await prisma.task.findMany({
        where: {
            userId: user.id,
            status: 'DONE',
            isRecurring: true,
            // recurrenceInterval: { not: null } 
        }
    })

    let processedCount = 0

    for (const task of completedRecurring) {
        // Simple logic: If daily, create new task for tomorrow.
        const originalDue = task.dueDate || new Date()
        let nextDue = new Date(originalDue)

        // Very basic interval parsing
        if (task.recurrenceInterval === 'DAILY') {
            nextDue.setDate(nextDue.getDate() + 1)
        } else if (task.recurrenceInterval === 'WEEKLY') {
            nextDue.setDate(nextDue.getDate() + 7)
        } else if (task.recurrenceInterval === 'MONTHLY') {
            nextDue.setMonth(nextDue.getMonth() + 1)
        } else {
            // Default +1 day if unknown
            nextDue.setDate(nextDue.getDate() + 1)
        }

        // Create Next Task
        await prisma.task.create({
            data: {
                title: task.title,
                description: task.description,
                status: 'INBOX', // Or NEXT
                priority: task.priority,
                energyLevel: task.energyLevel,
                estimatedMinutes: task.estimatedMinutes,
                isRecurring: true,
                recurrenceInterval: task.recurrenceInterval,
                dueDate: nextDue,
                projectId: task.projectId,
                userId: user.id,
                // Do not copy tags for now efficiently, user can re-tag or we fix later
            }
        })

        // Unmark original as recurring so we don't process it again?
        // Or keep it as history?
        // Better: Set original 'isRecurring' to false so it stops spawning, 
        // OR check if we already spawned one (harder without ID link).
        // Let's set original isRecurring to false to "consume" the spawn event.
        await prisma.task.update({
            where: { id: task.id },
            data: { isRecurring: false }
        })

        processedCount++
    }

    revalidatePath('/inbox')
    return { success: true, count: processedCount }
}

export async function archiveOldTasks() {
    const user = await getUser()
    // Find Someday tasks older than 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const result = await prisma.task.updateMany({
        where: {
            userId: user.id,
            status: 'SOMEDAY',
            updatedAt: { lt: sixMonthsAgo }
        },
        data: {
            status: 'ARCHIVED'
        }
    })

    revalidatePath('/inbox')
    return { success: true, count: result.count }
}

export async function cleanUnusedTags() {
    const user = await getUser()

    // Find tags with 0 or 1 usage (tasks + notes)
    // Prisma count aggregation is tricky for "filter by count" in one go efficiently without raw query or grouping.
    // For MVP/Ops script, fetching all tags and counting is acceptable if tag count < 1000.

    const tags = await prisma.tag.findMany({
        where: { userId: user.id },
        include: {
            _count: {
                select: { tasks: true, notes: true }
            }
        }
    })

    const tagsToDelete = tags.filter(t => (t._count.tasks + t._count.notes) <= 1).map(t => t.id)

    if (tagsToDelete.length > 0) {
        await prisma.tag.deleteMany({
            where: {
                id: { in: tagsToDelete },
                userId: user.id
            }
        })
    }

    return { success: true, count: tagsToDelete.length }
}

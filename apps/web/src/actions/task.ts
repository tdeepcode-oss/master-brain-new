'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

export type Task = {
    id: string
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'INBOX' | 'NEXT' | 'WAITING' | 'DONE' | 'SOMEDAY'
    projectId?: string
    isRecurring?: boolean
    recurrenceInterval?: string
}

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function getTasks(userId: string) {
    const sessionUser = await getUser()
    if (sessionUser.id !== userId) return []

    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            // Optional: Filter out done tasks if needed, but for now we return all or handle in UI
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority as Task['priority'],
        status: t.status as Task['status'],
        projectId: t.projectId || undefined,
        isRecurring: t.isRecurring,
        recurrenceInterval: t.recurrenceInterval || undefined
    }))
}

export async function createTask(formData: FormData) {
    const user = await getUser()

    const title = formData.get('title') as string
    const priority = formData.get('priority') as Task['priority']
    const isRecurring = formData.get('isRecurring') === 'on'
    const recurrenceInterval = formData.get('recurrenceInterval') as string

    await prisma.task.create({
        data: {
            title,
            priority: priority || 'MEDIUM',
            status: 'INBOX',
            userId: user.id,
            isRecurring,
            recurrenceInterval
        }
    })

    revalidatePath('/tasks')
    return { success: true }
}

export async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
    const user = await getUser()

    const task = await prisma.task.findUnique({
        where: { id: taskId, userId: user.id }
    })

    if (!task) return

    // Recurrence Logic
    if (newStatus === 'DONE' && task.isRecurring && task.recurrenceInterval) {
        // 1. Mark current as DONE
        await prisma.task.update({
            where: { id: taskId },
            data: { status: 'DONE', lastCompletedAt: new Date() }
        })

        // 2. Create NEXT occurrence
        // Calculate next due date (simplified)
        let nextDueDate = new Date()
        if (task.recurrenceInterval === 'DAILY') nextDueDate.setDate(nextDueDate.getDate() + 1)
        if (task.recurrenceInterval === 'WEEKLY') nextDueDate.setDate(nextDueDate.getDate() + 7)
        if (task.recurrenceInterval === 'MONTHLY') nextDueDate.setMonth(nextDueDate.getMonth() + 1)

        // Create new task
        await prisma.task.create({
            data: {
                title: task.title, // Keep same title
                description: task.description,
                priority: task.priority,
                status: 'NEXT', // Automove to NEXT? Or INBOX? Let's say NEXT.
                userId: user.id,
                isRecurring: true,
                recurrenceInterval: task.recurrenceInterval,
                dueDate: nextDueDate,
                projectId: task.projectId
            }
        })

    } else {
        // Normal update
        await prisma.task.update({
            where: {
                id: taskId,
                userId: user.id
            },
            data: {
                status: newStatus
            }
        })
    }

    revalidatePath('/tasks')
}

export async function seedTasks() {
    const user = await getUser()

    // Check if user already has tasks to avoid duplicates/spamming
    const existingCount = await prisma.task.count({
        where: { userId: user.id }
    })

    if (existingCount > 5) {
        return { success: false, message: 'You already have tasks. Seed skipped.' }
    }

    const seedData = [
        { title: 'Buy groceries for the week', priority: 'MEDIUM', status: 'INBOX' },
        { title: 'Review quarterly goals', priority: 'HIGH', status: 'NEXT' },
        { title: 'Schedule dentist appointment', priority: 'LOW', status: 'INBOX' },
        { title: 'Read "Getting Things Done"', priority: 'MEDIUM', status: 'SOMEDAY' },
        { title: 'Email Sarah about the project', priority: 'URGENT', status: 'NEXT' },
        { title: 'Waiting for design assets', priority: 'MEDIUM', status: 'WAITING' },
    ]

    await prisma.task.createMany({
        data: seedData.map(t => ({
            ...t,
            userId: user.id,
            priority: t.priority as Task['priority'],
            status: t.status as Task['status']
        }))
    })

    revalidatePath('/tasks')
    return { success: true, message: 'Example tasks added!' }
}

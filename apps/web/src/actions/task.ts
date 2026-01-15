'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

export type Task = {
    id: string
    title: string
    description?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'INBOX' | 'NEXT' | 'WAITING' | 'DONE' | 'SOMEDAY'
    energyLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
    estimatedMinutes?: number
    projectId?: string
    isRecurring?: boolean
    recurrenceInterval?: string
    dueDate?: Date
    myDayDate?: Date
    tags?: any[]
}

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Sync Supabase Auth user to Prisma Database
    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser) {
            console.log("Syncing user to database...", user.id)
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || "placeholder@email.com", // Fallback, though should not happen for email auth
                }
            })
        }
    } catch (error) {
        console.error("Error syncing user:", error)
    }

    return user
}

export async function getTasks(userId: string) {
    const sessionUser = await getUser()
    if (sessionUser.id !== userId) return []

    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: { tags: true }
    })

    return tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        priority: t.priority as Task['priority'],
        status: t.status as Task['status'],
        energyLevel: t.energyLevel as Task['energyLevel'],
        estimatedMinutes: t.estimatedMinutes || undefined,
        projectId: t.projectId || undefined,
        isRecurring: t.isRecurring,
        recurrenceInterval: t.recurrenceInterval || undefined,
        dueDate: t.dueDate || undefined,
        myDayDate: t.myDayDate || undefined,
        tags: t.tags
    }))
}

export async function createTask(formData: FormData) {
    const user = await getUser()

    const title = formData.get('title') as string
    const priority = formData.get('priority') as Task['priority']
    const isRecurring = formData.get('isRecurring') === 'on'
    const recurrenceInterval = formData.get('recurrenceInterval') as string
    const projectId = formData.get('projectId') as string

    await prisma.task.create({
        data: {
            title,
            priority: priority || 'MEDIUM',
            status: 'INBOX',
            userId: user.id,
            isRecurring,
            recurrenceInterval,
            projectId: projectId || undefined
        }
    })

    revalidatePath('/tasks')
    revalidatePath('/inbox')
    return { success: true }
}

export async function updateTask(taskId: string, data: Partial<Task> & { tagIds?: string[] }) {
    const user = await getUser()

    const existing = await prisma.task.findUnique({
        where: { id: taskId, userId: user.id }
    })

    if (!existing) throw new Error("Task not found")

    // Recurrence Handling if marking DONE
    if (data.status === 'DONE' && existing.isRecurring && existing.recurrenceInterval && existing.status !== 'DONE') {
        // 1. Mark current as DONE
        await prisma.task.update({
            where: { id: taskId },
            data: { status: 'DONE', lastCompletedAt: new Date() }
        })

        // 2. Create NEXT occurrence
        let nextDueDate = new Date()
        if (existing.recurrenceInterval === 'DAILY') nextDueDate.setDate(nextDueDate.getDate() + 1)
        if (existing.recurrenceInterval === 'WEEKLY') nextDueDate.setDate(nextDueDate.getDate() + 7)
        if (existing.recurrenceInterval === 'MONTHLY') nextDueDate.setMonth(nextDueDate.getMonth() + 1)

        await prisma.task.create({
            data: {
                title: existing.title,
                description: existing.description,
                priority: existing.priority,
                energyLevel: existing.energyLevel,
                estimatedMinutes: existing.estimatedMinutes,
                status: 'NEXT',
                userId: user.id,
                isRecurring: true,
                recurrenceInterval: existing.recurrenceInterval,
                dueDate: nextDueDate,
                projectId: existing.projectId
                // tags are not automatically copied in MVP to avoid clutter, or should they? Let's skip for now.
            }
        })
    } else {
        // Prepare update data
        const { tagIds, ...scalarData } = data
        const updateData: any = { ...scalarData }

        if (tagIds) {
            updateData.tags = {
                set: tagIds.map(id => ({ id }))
            }
        }

        await prisma.task.update({
            where: {
                id: taskId,
                userId: user.id
            },
            data: updateData
        })
    }

    revalidatePath('/tasks')
    revalidatePath('/inbox')
    revalidatePath('/today')
}

export async function updateTaskStatus(id: string, status: Task['status']) {
    return updateTask(id, { status })
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

export async function deleteTask(taskId: string) {
    const user = await getUser()

    await prisma.task.delete({
        where: {
            id: taskId,
            userId: user.id // Security: Ensure user owns the task
        }
    })

    revalidatePath('/tasks')
}

export async function createInboxTask(title: string) {
    const user = await getUser()

    await prisma.task.create({
        data: {
            title,
            userId: user.id,
            status: 'INBOX',
            priority: 'MEDIUM'
        }
    })

    revalidatePath('/inbox')
    revalidatePath('/tasks')
}

export async function scheduleTask(taskId: string, date: Date) {
    const user = await getUser()

    await prisma.task.update({
        where: { id: taskId, userId: user.id },
        data: { dueDate: date, status: 'NEXT' }
    })

    revalidatePath('/inbox')
    revalidatePath('/today')
    revalidatePath('/tasks')
}

export async function toggleMyDay(taskId: string, isAdded: boolean) {
    const user = await getUser()

    await prisma.task.update({
        where: { id: taskId, userId: user.id },
        data: {
            myDayDate: isAdded ? new Date() : null
        }
    })

    revalidatePath('/today')
    revalidatePath('/tasks')
    revalidatePath('/inbox')
}


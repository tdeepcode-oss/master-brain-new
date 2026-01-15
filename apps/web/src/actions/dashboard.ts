'use server'

import { prisma } from '@repo/database'
import { createClient } from '../lib/supabase/server'
import { Task } from './task'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export type DashboardData = {
    stats: {
        inboxCount: number
        dueTodayCount: number
        completedTodayCount: number
        activeProjectsCount: number
        learningStreak: number
    }
    focusTasks: Task[]
    activeProjects: {
        id: string
        name: string
        status: string
        progress: number
        nextAction?: string
    }[]
    recentNotes: {
        id: string
        title: string
        updatedAt: Date
    }[]
}

export async function getDashboardData(): Promise<DashboardData> {
    const user = await getUser()

    // Run queries in parallel for performance
    const [
        inboxCount,
        dueTodayTasks,
        completedTodayCount,
        activeProjects,
        recentNotes
    ] = await Promise.all([
        // 1. Inbox Count
        prisma.task.count({
            where: { userId: user.id, status: 'INBOX' }
        }),
        // 2. Focus Tasks (Due Today OR Marked as NEXT, limit 5)
        prisma.task.findMany({
            where: {
                userId: user.id,
                OR: [
                    { status: 'NEXT' },
                    {
                        status: { not: 'DONE' },
                        dueDate: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lt: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    }
                ]
            },
            take: 5,
            orderBy: [
                { priority: 'desc' }, // URGENT first
                { dueDate: 'asc' }    // Sol soonest
            ],
            include: { tags: true }
        }),
        // 3. Completed Today
        prisma.task.count({
            where: {
                userId: user.id,
                status: 'DONE',
                updatedAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        }),
        // 4. Active Projects (with task count for progress approximation)
        prisma.project.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            take: 4,
            include: {
                _count: {
                    select: { tasks: { where: { status: 'DONE' } } }
                },
                tasks: {
                    take: 1, // Get one next action
                    where: { status: 'NEXT' }
                }
            }
        }),
        // 5. Recent Notes
        prisma.note.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            select: { id: true, title: true, updatedAt: true }
        })
    ])

    // Transform Projects to get specific progress if total tasks available 
    // (Prisma relation count is limited, we might need two counts or just estimate. 
    //  For MVP, let's just use a placeholder progress or calculate if we fetch totals.)
    //  Actually let's stick to simple "Active" list for now.

    // Mapping keys to type
    const mappedProjects = activeProjects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: 0, // TODO: Implement real progress calculation (done / total)
        nextAction: p.tasks[0]?.title
    }))

    const mappedTasks = dueTodayTasks.map(t => ({
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
        tags: t.tags
    }))

    return {
        stats: {
            inboxCount,
            dueTodayCount: dueTodayTasks.filter(t => t.dueDate).length,
            completedTodayCount,
            activeProjectsCount: activeProjects.length,
            learningStreak: 3 // Mock for now
        },
        focusTasks: mappedTasks,
        activeProjects: mappedProjects,
        recentNotes: recentNotes
    }
}

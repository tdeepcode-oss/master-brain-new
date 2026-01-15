'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export type ReviewData = {
    inboxCount: number
    waitingTasks: any[]
    activeProjects: any[]
    somedayTasks: any[]
}

export async function getReviewData(): Promise<ReviewData> {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    const [inboxCount, waitingTasks, activeProjects, somedayTasks] = await Promise.all([
        prisma.task.count({
            where: { userId: user.id, status: 'INBOX' }
        }),
        prisma.task.findMany({
            where: { userId: user.id, status: 'WAITING' },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.project.findMany({
            where: { userId: user.id, status: 'ACTIVE' },
            include: { _count: { select: { tasks: true } } }
        }),
        prisma.task.findMany({
            where: { userId: user.id, status: 'SOMEDAY' },
            orderBy: { createdAt: 'desc' }
        })
    ])

    return {
        inboxCount,
        waitingTasks,
        activeProjects,
        somedayTasks
    }
}

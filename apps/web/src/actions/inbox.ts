'use server'

import { prisma } from '@repo/database'
import { createClient } from '../lib/supabase/server'

export type InboxItem =
    | { type: 'TASK', data: any }
    | { type: 'NOTE', data: any }
    | { type: 'RESOURCE', data: any }

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function getInboxItems(): Promise<InboxItem[]> {
    const user = await getUser()

    const [tasks, notes, resources] = await Promise.all([
        prisma.task.findMany({
            where: {
                userId: user.id,
                status: 'INBOX'
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.note.findMany({
            where: {
                userId: user.id,
                isInbox: true
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.resource.findMany({
            where: {
                userId: user.id,
                isInbox: true
            },
            orderBy: { createdAt: 'desc' }
        })
    ])

    const items: InboxItem[] = [
        ...tasks.map(t => ({ type: 'TASK' as const, data: t })),
        ...notes.map(n => ({ type: 'NOTE' as const, data: n })),
        ...resources.map(r => ({ type: 'RESOURCE' as const, data: r }))
    ]

    // Sort by creation date (newest first)
    return items.sort((a, b) =>
        new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    )
}

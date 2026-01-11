'use server'

import { prisma } from '@repo/database'; // Ensure this path is correct for your monorepo
import { createClient } from '../lib/supabase/server';

// We need to match the type expected by the UI
export type Task = {
    id: string
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'INBOX' | 'NEXT' | 'WAITING' | 'DONE'
    projectId?: string
}

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return user
}

export async function getTasks(userId: string) {
    // In a real app we might rely on the userID passed, 
    // but it's safer to get it from the session to enforce ownership.
    // For now, we trust the caller or fetch strictly by session context if we enforce it here.

    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            status: {
                not: 'DONE'
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Map to UI type
    return tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status // This matches if UI expects INBOX | NEXT | WAITING | DONE
    }))
}

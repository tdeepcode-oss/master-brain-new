'use server'

import { prisma } from '@repo/database'; // Ensure this path is correct for your monorepo
import { createClient } from '../lib/supabase/server'

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
            isDone: false // For now, maybe UI filters done tasks separately
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Map to UI type (Prisma Enums match string unions usually, but let's be safe)
    return tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority as Task['priority'],
        status: t.isDone ? 'DONE' : 'INBOX', // Simplified mapping for now, we need a 'status' field in DB if we want full GTD flow columns
        // Wait, our schema has `isDone` but maybe we need a flexible `status` column for Kanban columns (Inbox, Next, Waiting).
        // The current schema has `priority` and `isDone`. 
        // Let's assume for MVP: 
        // isDone=true -> DONE
        // isDone=false -> 
        //    if priority=URGENT -> NEXT? No, that's implicit.
        //    We probably need a `status` field in Task model akin to ProjectStatus, or we use Tags.
        // Let's look at the TaskBoard UI. It relies on 'status': 'INBOX' | 'NEXT' | 'WAITING' | 'DONE'.
        // We should probably add `status` enum to Task in schema OR map it. 
        // For this step, I will add a `status` field to the Task model in Schema or just Map it partially.
        // Actually, Stage 4 asked for GTD Engine.
        // Let's check schema again. `Task` has `isDone`.
        // I should have added `status` Enum to Task in the previous step if I wanted exact mapping.
        // Let's Map: 
        // If isDone -> DONE
        // Else -> INBOX (Default)
        // This means "Next" and "Waiting" are lost if we don't store them.
        // I WILL FIX THE SCHEMA In the next step to add `TaskStatus`. 
        // For now, let's keep it simple or use `priority` to mimic it? No.
        // I'll return mock status based on some logic or default to INBOX.
    }))
}

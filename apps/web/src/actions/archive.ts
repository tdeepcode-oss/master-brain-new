'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export type ArchivedData = {
    projects: any[]
    tasks: any[]
}

export async function getArchivedItems(): Promise<ArchivedData> {
    const user = await getUser()
    if (!user) return { projects: [], tasks: [] }

    const [projects, tasks] = await Promise.all([
        prisma.project.findMany({
            where: { userId: user.id, status: 'ARCHIVED' },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.task.findMany({
            where: { userId: user.id, status: 'ARCHIVED' },
            orderBy: { updatedAt: 'desc' }
        })
    ])

    return { projects, tasks }
}

export async function restoreItem(type: 'PROJECT' | 'TASK', id: string) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    if (type === 'PROJECT') {
        await prisma.project.update({
            where: { id, userId: user.id },
            data: { status: 'ACTIVE' }
        })
    } else {
        await prisma.task.update({
            where: { id, userId: user.id },
            data: { status: 'NEXT' } // Restore to Next Actions usually, or Inbox? Let's say Next.
        })
    }

    revalidatePath('/archives')
    revalidatePath('/projects')
    revalidatePath('/tasks')
}

export async function deleteItemPermanently(type: 'PROJECT' | 'TASK', id: string) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    if (type === 'PROJECT') {
        await prisma.project.delete({
            where: { id, userId: user.id }
        })
    } else {
        await prisma.task.delete({
            where: { id, userId: user.id }
        })
    }

    revalidatePath('/archives')
}

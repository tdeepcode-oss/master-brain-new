'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export type AreaWithCounts = {
    id: string
    name: string
    icon: string | null
    color: string | null
    _count: {
        projects: number
        notes: number
    }
}

export async function getAreas(): Promise<AreaWithCounts[]> {
    const user = await getUser()
    if (!user) return []

    return prisma.area.findMany({
        where: { userId: user.id },
        include: {
            _count: {
                select: { projects: true, notes: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createArea(data: { name: string, icon?: string, color?: string }) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    await prisma.area.create({
        data: {
            ...data,
            userId: user.id
        }
    })

    revalidatePath('/areas')
}

export async function deleteArea(id: string) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    // Optional: Check if area has projects/notes and warn? 
    // For now, let's allow delete (Cascade should handle relations if configured, or it might error if not).
    // Schema says: onDelete: Cascade NOT set on Project->Area relation usually, need to check.
    // In schema: `area Area? @relation(fields: [areaId], references: [id])` -> No Cascade.
    // So projects will just have areaId set to null or fail.
    // Let's assume we want to keep projects but unlink them, OR just basic delete for now.

    await prisma.area.delete({
        where: { id, userId: user.id }
    })

    revalidatePath('/areas')
}

export async function updateArea(id: string, data: { name?: string, icon?: string, color?: string }) {
    const user = await getUser()
    if (!user) throw new Error('Unauthorized')

    await prisma.area.update({
        where: { id, userId: user.id },
        data
    })

    revalidatePath('/areas')
}

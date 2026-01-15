'use server'

import { prisma } from '@repo/database'
import { createClient } from '../lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function getTags() {
    const user = await getUser()
    return prisma.tag.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
    })
}

export async function searchTags(query: string) {
    const user = await getUser()
    return prisma.tag.findMany({
        where: {
            userId: user.id,
            name: { contains: query, mode: 'insensitive' }
        },
        take: 5
    })
}

export async function createTag(name: string) {
    const user = await getUser()

    // Check if exists
    const existing = await prisma.tag.findUnique({
        where: {
            userId_name: {
                userId: user.id,
                name
            }
        }
    })

    if (existing) return existing

    const tag = await prisma.tag.create({
        data: {
            name,
            userId: user.id,
            color: 'indigo' // Default color logic could be random or fixed
        }
    })

    return tag
}

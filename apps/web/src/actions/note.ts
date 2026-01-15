'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

// Note Type Definition for UI consistency
export type Note = {
    id: string
    title: string
    content: string
    updatedAt: Date
    createdAt: Date
    isInbox: boolean
}

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function createNote(title: string = "Untitled Note") {
    const user = await getUser()

    const note = await prisma.note.create({
        data: {
            title,
            content: '',
            userId: user.id
        }
    })

    revalidatePath('/library')
    return note
}

export async function updateNote(id: string, title?: string, content?: any, tags?: string[], projectId?: string) {
    const user = await getUser()

    // Validate ownership
    const existing = await prisma.note.findUnique({
        where: { id, userId: user.id },
        include: { suggestedLinks: true }
    })

    if (!existing) throw new Error("Note not found")

    // Parse Content for Links
    const linkRegex = /href="\/notes\/([a-zA-Z0-9-]+)"/g
    const foundIds = new Set<string>()
    let match
    if (content) {
        while ((match = linkRegex.exec(content)) !== null) {
            foundIds.add(match[1])
        }
    }

    // Sync Relations (Links)
    const currentLinkIds = existing.suggestedLinks.map(n => n.id)
    const newLinkIds = Array.from(foundIds)

    const toConnect = newLinkIds.filter(id => !currentLinkIds.includes(id))
    const toDisconnect = currentLinkIds.filter(id => !newLinkIds.includes(id))

    // Prepare Update Data
    const updateData: any = {
        title: title ?? undefined,
        content: content ?? undefined,
        updatedAt: new Date(),
        suggestedLinks: {
            connect: toConnect.map(id => ({ id })),
            disconnect: toDisconnect.map(id => ({ id }))
        }
    }

    // Handle projectId update
    if (projectId !== undefined) {
        if (projectId === 'remove') {
            updateData.projectId = null
        } else {
            updateData.projectId = projectId
        }
    }

    if (tags) { // Assuming 'tags' parameter is an array of tag IDs
        updateData.tags = {
            set: tags.map(id => ({ id }))
        }
    }

    await prisma.note.update({
        where: { id },
        data: updateData
    })

    revalidatePath('/library')
    revalidatePath(`/notes/${id}`)
    toConnect.forEach(targetId => revalidatePath(`/notes/${targetId}`))
    toDisconnect.forEach(targetId => revalidatePath(`/notes/${targetId}`))
}

export async function getNotes(tagId?: string) {
    const user = await getUser()

    const where: any = { userId: user.id }
    if (tagId) {
        where.tags = {
            some: { id: tagId }
        }
    }

    const notes = await prisma.note.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: { tags: true }
    })

    return notes as any[]
}

export async function getNote(id: string) {
    const user = await getUser()

    const note = await prisma.note.findUnique({
        where: { id, userId: user.id },
        include: {
            backlinks: {
                select: { id: true, title: true, updatedAt: true }
            },
            tags: true
        }
    })

    return note as any
}

export async function deleteNote(id: string) {
    const user = await getUser()

    await prisma.note.delete({
        where: { id, userId: user.id }
    })

    revalidatePath('/library')
}

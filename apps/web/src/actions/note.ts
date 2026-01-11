'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'

export async function getNote(noteId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const note = await prisma.note.findUnique({
        where: { id: noteId },
        include: { tags: true } // Include tags
    })

    if (note && note.userId !== user.id) return null
    return note
}

export async function saveNote(noteId: string, content: any, title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const contentString = JSON.stringify(content)

    // 1. Extract Wiki Links [[Link]]
    const wikiLinkRegex = /\[\[(.*?)\]\]/g
    const linkMatches = [...contentString.matchAll(wikiLinkRegex)]
    const linkedTitles = linkMatches.map(m => m[1])

    // 2. Extract Tags #tag
    // Regex for hashtags (simplified): #(\w+)
    const tagRegex = /#(\w+)/g
    const tagMatches = [...contentString.matchAll(tagRegex)]
    const tagsFound = [...new Set(tagMatches.map(m => m[1].toLowerCase()))] // Unique, lowercase

    // Update Note
    const existing = await prisma.note.findUnique({ where: { id: noteId } })

    if (existing) {
        if (existing.userId !== user.id) throw new Error("Unauthorized")

        await prisma.note.update({
            where: { id: noteId },
            data: {
                content: contentString,
                title: title,
                updatedAt: new Date()
            }
        })
    } else {
        await prisma.note.create({
            data: {
                id: noteId,
                title: title,
                content: contentString,
                userId: user.id
            }
        })
    }

    // 3. Process Tags
    // Connect or Create tags
    // First, disconnect all tags from this note (to handle removals) - Prisma `set` is cleaner if we had the IDs,
    // but here we have names.
    // Strategy: Find/Create all tags, then `set` the relation.

    const tagIds = []
    for (const tagName of tagsFound) {
        // Find or create tag for this user
        // Use upsert-like logic (Prisma upsert works on unique constraint)
        // Schema: @@unique([userId, name])
        const tag = await prisma.tag.upsert({
            where: {
                userId_name: {
                    userId: user.id,
                    name: tagName
                }
            },
            update: {}, // No change if exists
            create: {
                userId: user.id,
                name: tagName,
                color: 'blue' // default
            }
        })
        tagIds.push({ id: tag.id })
    }

    // Update Note Tags Relation
    await prisma.note.update({
        where: { id: noteId },
        data: {
            tags: {
                set: tagIds // Replace all existing with current list
            }
        }
    })

    // 4. Update Relations (Backlinks)
    await prisma.entityRelation.deleteMany({
        where: {
            sourceId: noteId,
            type: 'MENTION'
        }
    })

    for (const linkTitle of linkedTitles) {
        const targetNote = await prisma.note.findFirst({
            where: {
                userId: user.id,
                title: {
                    equals: linkTitle,
                    mode: 'insensitive'
                }
            }
        })

        if (targetNote) {
            await prisma.entityRelation.create({
                data: {
                    sourceId: noteId,
                    sourceType: 'NOTE',
                    targetId: targetNote.id,
                    targetType: 'NOTE',
                    type: 'MENTION',
                    userId: user.id
                }
            })
        }
    }

    return { success: true }
}

export async function getBacklinks(noteId: string) {
    const relations = await prisma.entityRelation.findMany({
        where: {
            targetId: noteId,
            type: 'MENTION'
        }
    })

    const sourceIds = relations.filter(r => r.sourceType === 'NOTE').map(r => r.sourceId)
    if (sourceIds.length === 0) return []

    const sourceNotes = await prisma.note.findMany({
        where: { id: { in: sourceIds } },
        select: { id: true, title: true }
    })

    return sourceNotes
}

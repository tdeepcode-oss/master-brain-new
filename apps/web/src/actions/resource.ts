'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function saveUrl(url: string, titleOverride?: string) {
    const user = await getUser()

    // 1. Validate URL (basic)
    if (!url.startsWith('http')) {
        url = 'https://' + url
    }

    let title = titleOverride || url
    let description = ''

    // 2. Scrape Metadata (Only if no title provided or just to get description?)
    // If we have titleOverride, we might still want description.
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'MasteryBrain/1.0 (bot)' // Be polite
            }
        })
        clearTimeout(timeoutId)

        if (res.ok) {
            const html = await res.text()

            // Simple Regex Extraction
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            if (titleMatch) title = titleMatch[1].trim()

            const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
            if (descriptionMatch) description = descriptionMatch[1].trim()
        }
    } catch (error) {
        console.error("Failed to scrape URL:", error)
        // Fallback to minimal info if fetch fails
    }

    // 3. Create Resource
    const resource = await prisma.resource.create({
        data: {
            title,
            url,
            type: 'LINK',
            userId: user.id
        }
    })

    // 4. Create Inbox Task
    // "Read: <Title>"
    await prisma.task.create({
        data: {
            title: `Read: ${title}`,
            description: `URL: ${url}\n\n${description}`, // Store URL and meta desc
            status: 'INBOX',
            userId: user.id
            // We could link to resource if we had a relation, but description is fine for MVP
        }
    })

    revalidatePath('/inbox')
    revalidatePath('/resources')

    return { success: true, title }
}

export async function createResource(formData: FormData) {
    const user = await getUser()
    const title = formData.get('title') as string
    const url = formData.get('url') as string
    const type = formData.get('type') as 'LINK' | 'FILE' | 'BOOK' | 'COURSE'
    const projectId = formData.get('projectId') as string

    if (!title) return

    await prisma.resource.create({
        data: {
            title,
            url: url || undefined,
            type: type || 'LINK',
            projectId: projectId || undefined,
            userId: user.id
        }
    })

    revalidatePath('/resources')
}

export async function deleteResource(id: string) {
    const user = await getUser()
    await prisma.resource.delete({
        where: { id, userId: user.id }
    })
    revalidatePath('/resources')
}

export type Resource = {
    id: string
    title: string
    url?: string | null
    type: 'LINK' | 'FILE' | 'BOOK' | 'COURSE'
    projectId?: string | null
    userId: string
    createdAt: Date
}

export type ResourceFilter = {
    type?: 'LINK' | 'FILE' | 'BOOK' | 'COURSE'
    projectId?: string
}

export async function getResources(filter?: ResourceFilter) {
    const user = await getUser()

    return prisma.resource.findMany({
        where: {
            userId: user.id,
            type: filter?.type,
            projectId: filter?.projectId
        },
        orderBy: { createdAt: 'desc' },
        include: {
            project: { select: { id: true, name: true } }
        }
    })
}

export async function updateResource(id: string, updates: Partial<Resource>) {
    const user = await getUser()

    // Whitelist allowed fields for security/safety if needed, but Partial is convenient
    const { id: _, userId: __, createdAt: ___, ...data } = updates as any

    await prisma.resource.update({
        where: { id, userId: user.id },
        data
    })

    revalidatePath('/resources')
    revalidatePath('/inbox')
}

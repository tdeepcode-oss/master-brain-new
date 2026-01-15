'use server'

import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { createClient } from '../lib/supabase/server'
import { Note } from './note'
import { Resource } from './resource'
import { Task } from './task'

export type Project = {
    id: string
    name: string
    status: 'IDEA' | 'RESEARCH' | 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD'
    deadline: Date | null
    createdAt: Date
    updatedAt: Date
    tasks?: Task[]
    notes?: Note[]
    resources?: Resource[]
}

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    return user
}

export async function getProjects() {
    const user = await getUser()

    const projects = await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            tasks: {
                select: { id: true, status: true } // Minimal selection for progress calc
            }
        }
    })

    return projects
}

export async function getProject(id: string) {
    const user = await getUser()

    const project = await prisma.project.findUnique({
        where: { id, userId: user.id },
        include: {
            tasks: { orderBy: { createdAt: 'desc' } },
            notes: { orderBy: { updatedAt: 'desc' } },
            resources: { orderBy: { createdAt: 'desc' } }
        }
    })

    return project
}

export async function createProject(formData: FormData) {
    const user = await getUser()
    const name = formData.get('name') as string
    const deadlineStr = formData.get('deadline') as string

    if (!name) return

    await prisma.project.create({
        data: {
            name,
            userId: user.id,
            deadline: deadlineStr ? new Date(deadlineStr) : null,
            status: 'ACTIVE'
        }
    })

    revalidatePath('/projects')
}

export async function updateProjectStatus(id: string, status: Project['status']) {
    const user = await getUser()

    await prisma.project.update({
        where: { id, userId: user.id },
        data: { status: status as any } // Cast to any to bypass strict Enum matching for now
    })

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
}

export async function deleteProject(id: string) {
    const user = await getUser()

    await prisma.project.delete({
        where: { id, userId: user.id }
    })

    revalidatePath('/projects')
}

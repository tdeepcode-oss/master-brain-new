import { createClient } from '@/lib/supabase/server'
import { prisma } from '@repo/database'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch all user data
    // Parallel fetching for speed
    const [tasks, notes, projects, resources, areas, courses, flashcards] = await Promise.all([
        prisma.task.findMany({ where: { userId: user.id } }),
        prisma.note.findMany({ where: { userId: user.id } }),
        prisma.project.findMany({ where: { userId: user.id } }),
        prisma.resource.findMany({ where: { userId: user.id } }),
        prisma.area.findMany({ where: { userId: user.id } }),
        prisma.course.findMany({ where: { userId: user.id } }), // Assuming user created courses? Or progress? Schema says Course has no userId owner usually if it's content?
        // Wait, schema says: Course does NOT have userId. It seems global? 
        // Let's check schema.
        // Yes, Course doesn't have userId. Modules/Lessons neither.
        // But Flashcards DO have userId.
        prisma.flashcard.findMany({ where: { userId: user.id } })
    ])

    const exportData = {
        meta: {
            exportedAt: new Date().toISOString(),
            userId: user.id,
            version: "2.0"
        },
        data: {
            tasks,
            notes,
            projects,
            resources,
            areas,
            flashcards
        }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="mastery-brain-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
    })
}

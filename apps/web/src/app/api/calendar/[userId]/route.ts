import { prisma } from '@repo/database'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const userId = params.userId

    if (!userId) {
        return new NextResponse('Invalid User ID', { status: 400 })
    }

    // Fetch tasks with due dates
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId,
            dueDate: { not: null },
            status: { not: 'DONE' } // Only active tasks? Or all? Usually active.
        },
        select: {
            id: true,
            title: true,
            dueDate: true,
            description: true
        }
    })

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MasteryBrain//V2//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:Mastery Brain Tasks\n`

    tasks.forEach(task => {
        if (!task.dueDate) return

        // For all-day events vs specific time, let's assume specific time or simple day
        // Using straight ISO conversion for simplicity
        const start = formatDate(task.dueDate)
        const end = formatDate(new Date(task.dueDate.getTime() + 60 * 60 * 1000)) // +1 hour default

        icsContent += `BEGIN:VEVENT\n`
        icsContent += `UID:${task.id}\n`
        icsContent += `DTSTAMP:${formatDate(new Date())}\n`
        icsContent += `DTSTART:${start}\n`
        icsContent += `DTEND:${end}\n`
        icsContent += `SUMMARY:${task.title}\n`
        if (task.description) {
            icsContent += `DESCRIPTION:${task.description.replace(/\n/g, '\\n')}\n`
        }
        icsContent += `END:VEVENT\n`
    })

    icsContent += `END:VCALENDAR`

    return new NextResponse(icsContent, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="tasks.ics"',
        },
    })
}

'use client'

import { processRecurringTasks } from '@/actions/automation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Archive, BookMarked, Calendar, Download, Play, Save, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
        const getU = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getU()
    }, [])

    const handleRunAutomation = async () => {
        if (confirm('Process recurring tasks? This will spawn new tasks for completed recurring items.')) {
            const res = await processRecurringTasks()
            if (res.success) {
                alert(`Processed ${res.count} tasks.`)
            }
        }
    }

    const bookmarkletCode = `javascript:(function(){window.open('${origin}/inbox/capture?url='+encodeURIComponent(window.location.href)+'&title='+encodeURIComponent(document.title), '_blank');})()`
    const calendarUrl = userId ? `${origin}/api/calendar/${userId}` : 'Loading...'

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white mb-6">Settings & Integrations</h1>

            {/* Web Clipper */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <BookMarked className="text-indigo-500" />
                    <h2 className="text-xl font-semibold">Web Clipper Bookmarklet</h2>
                </div>
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <p className="text-zinc-400 mb-4 text-sm">
                        Drag the button below to your browser's bookmarks bar. Click it on any website to save it to your Inbox.
                    </p>
                    <a
                        href={bookmarkletCode}
                        className="inline-block bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-bold py-2 px-4 rounded-full border border-zinc-700 transition-colors cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.preventDefault()}
                    >
                        Save to Mastery Brain
                    </a>
                    <p className="mt-4 text-xs text-zinc-600 font-mono break-all">
                        {bookmarkletCode}
                    </p>
                </Card>
            </section>

            {/* Calendar Integration */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-emerald-500" />
                    <h2 className="text-xl font-semibold">Calendar Feed (iCal)</h2>
                </div>
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <p className="text-zinc-400 mb-4 text-sm">
                        Subscribe to your tasks in Google Calendar, Apple Calendar, or Outlook using this URL.
                    </p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={calendarUrl}
                            className="bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 flex-1 font-mono"
                        />
                        <Button variant="outline" onClick={() => navigator.clipboard.writeText(calendarUrl)}>
                            Copy
                        </Button>
                    </div>
                </Card>
            </section>

            {/* Data Operations */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <Save className="text-orange-500" />
                    <h2 className="text-xl font-semibold">Data Operations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-6 bg-zinc-900 border-zinc-800 flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Export Data</h3>
                            <p className="text-zinc-500 text-sm mb-4">Download a JSON backup of all your notes, tasks, and projects.</p>
                        </div>
                        <a href="/api/export" target="_blank">
                            <Button className="w-full gap-2" variant="secondary">
                                <Download className="w-4 h-4" /> Download Backup
                            </Button>
                        </a>
                    </Card>

                    <Card className="p-6 bg-zinc-900 border-zinc-800 flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Run Automations</h3>
                            <p className="text-zinc-500 text-sm mb-4">Manually trigger recurring task generation and maintenance routines.</p>
                        </div>
                        <div className="space-y-2">
                            <Button className="w-full gap-2" onClick={handleRunAutomation}>
                                <Play className="w-4 h-4" /> Process Recurring
                            </Button>

                            <Button className="w-full gap-2" variant="outline" onClick={async () => {
                                if (confirm('Archive all Someday tasks older than 6 months?')) {
                                    const { archiveOldTasks } = await import('@/actions/automation')
                                    const res = await archiveOldTasks()
                                    alert(`Archived ${res.count} tasks.`)
                                }
                            }}>
                                <Archive className="w-4 h-4" /> Archive Stale Tasks
                            </Button>

                            <Button className="w-full gap-2" variant="outline" onClick={async () => {
                                if (confirm('Delete unused tags (<= 1 usage)?')) {
                                    const { cleanUnusedTags } = await import('@/actions/automation')
                                    const res = await cleanUnusedTags()
                                    alert(`Deleted ${res.count} unused tags.`)
                                }
                            }}>
                                <Tag className="w-4 h-4" /> Clean Unused Tags
                            </Button>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    )
}

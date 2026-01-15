import { getDashboardData } from '@/actions/dashboard'
import { FocusList } from '@/components/dashboard/focus-list'
import { Greeting } from '@/components/dashboard/greeting'
import { ProjectGrid } from '@/components/dashboard/project-grid'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const data = await getDashboardData()

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <Greeting userName={user.email?.split('@')[0] || 'User'} />

                <div className="flex gap-3">
                    <Link href="/notes/new">
                        <Button variant="secondary" className="gap-2">
                            <FileText className="w-4 h-4" /> New Note
                        </Button>
                    </Link>
                    <Link href="/inbox">
                        <Button className="gap-2 shadow-lg shadow-indigo-500/20">
                            <Plus className="w-4 h-4" /> Quick Capture
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Key Stats */}
            <StatsGrid stats={data.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Focus Area (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Projects */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                Active Projects
                            </h2>
                            <Link href="/projects" className="text-xs text-zinc-500 hover:text-indigo-400">View All</Link>
                        </div>
                        <ProjectGrid projects={data.activeProjects} />
                    </section>

                    {/* Recent Notes */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
                                Recent Notes
                            </h2>
                            <Link href="/library" className="text-xs text-zinc-500 hover:text-indigo-400">View Library</Link>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                            {data.recentNotes.length > 0 ? data.recentNotes.map(note => (
                                <Link href={`/notes/${note.id}`} key={note.id} className="block p-4 hover:bg-white/5 transition-colors group">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-zinc-300 font-medium group-hover:text-white">{note.title}</h3>
                                        <span className="text-xs text-zinc-600">{new Date(note.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-6 text-center text-zinc-500 text-sm">No recent notes.</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Focus Area (1/3 width) */}
                <div className="space-y-8">
                    <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Focus Queue
                        </h2>
                        <FocusList tasks={data.focusTasks} />
                    </section>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-white/5">
                        <h3 className="font-semibold text-indigo-300 mb-2">Quote of the Day</h3>
                        <p className="text-sm text-zinc-300 italic">"The secret of getting ahead is getting started."</p>
                        <p className="text-xs text-zinc-500 mt-2">— Mark Twain</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


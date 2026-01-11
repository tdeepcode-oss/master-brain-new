import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'

export default async function Dashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Mock Data for now until DB connection is live
    const stats = {
        inboxCount: 3,
        activeProjects: 2,
        areas: 4,
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* Sidebar - simplified for MVP */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/10 bg-zinc-950 p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-10">
                    <div className="h-6 w-6 rounded bg-indigo-500" />
                    <span className="font-bold text-lg tracking-tight">Mastery Brain</span>
                </div>

                <nav className="space-y-1">
                    <NavItem href="/" active>Dashboard</NavItem>
                    <NavItem href="/tasks">Inbox <Badge>{stats.inboxCount}</Badge></NavItem>
                    <div className="my-4 h-px bg-white/5" />
                    <NavItem href="/projects">Projects</NavItem>
                    <NavItem href="/areas">Areas</NavItem>
                    <NavItem href="/resources">Resources</NavItem>
                    <NavItem href="/archives">Archives</NavItem>
                    <div className="my-4 h-px bg-white/5" />
                    <NavItem href="/learn">Start Learning</NavItem>
                    <NavItem href="/review">Review Cards <Badge>3</Badge></NavItem>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Good Morning, {user.email?.split('@')[0]}</h1>
                        <p className="text-zinc-500 mt-1">Ready to capture chaos into order?</p>
                    </div>
                    <Link href="/tasks" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        + Quick Capture
                    </Link>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Active Projects */}
                    <div className="lg:col-span-2 space-y-6">
                        <SectionTitle>Active Projects</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/projects"><ProjectCard title="Website Redesign" progress={35} status="On Track" color="bg-emerald-500" /></Link>
                            <Link href="/projects"><ProjectCard title="Book Writing" progress={12} status="At Risk" color="bg-rose-500" /></Link>
                            <Link href="/projects"><ProjectCard title="Q3 Planning" progress={0} status="Not Started" color="bg-zinc-500" /></Link>
                        </div>

                        <SectionTitle className="mt-8">Recent Actions (Inbox)</SectionTitle>
                        <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
                            {[1, 2, 3].map((i) => (
                                <Link href="/tasks" key={i} className="p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="h-4 w-4 rounded-full border border-zinc-600 group-hover:border-indigo-400" />
                                    <span className="text-zinc-300 text-sm">Review architectural diagrams for the new module...</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Areas & Stats */}
                    <div className="space-y-6">
                        <SectionTitle>Areas of Responsibility</SectionTitle>
                        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-4 space-y-3">
                            <AreaRow title="Health & Fitness" />
                            <AreaRow title="Finance" />
                            <AreaRow title="Career Development" />
                            <AreaRow title="Home" />
                        </div>

                        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                            <h3 className="text-indigo-400 font-medium text-sm mb-2">Weekly Insight</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                You've captured 12 new items this week but only processed 4. Time for a Weekly Review?
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

// Simple Components
function NavItem({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {children}
        </Link>
    )
}

function Badge({ children }: { children: React.ReactNode }) {
    return <span className="bg-white/10 text-zinc-300 text-xs px-1.5 py-0.5 rounded">{children}</span>
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={`text-sm font-medium text-zinc-500 uppercase tracking-wider ${className}`}>{children}</h2>
}

function ProjectCard({ title, progress, status, color }: any) {
    return (
        <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-zinc-200 group-hover:text-white">{title}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400`}>{status}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}

function AreaRow({ title }: { title: string }) {
    return (
        <Link href="/areas" className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="text-sm text-zinc-300">{title}</span>
        </Link>
    )
}

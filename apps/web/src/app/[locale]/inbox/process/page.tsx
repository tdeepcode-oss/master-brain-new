import { getInboxItems } from '@/actions/inbox'
import { getProjects } from '@/actions/project'; // Import getProjects
import { InboxProcess } from '@/components/gtd/inbox-process'
import { createClient } from '@/lib/supabase/server'
import { Loader2 } from 'lucide-react'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function InboxProcessPage() {
    const user = await getUser()

    if (!user) return <div>Please login.</div>

    // Unified inbox fetch
    const inboxItems = await getInboxItems()

    // Fetch active projects
    const allProjects = await getProjects()
    const activeProjects = allProjects.filter(p => p.status === 'ACTIVE' || p.status === 'PLANNING')

    return (
        <div className="min-h-screen bg-black text-white p-8 mb-20 md:mb-0">
            <h1 className="text-2xl font-bold text-center mb-2 text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                Inbox Processing
            </h1>
            <p className="text-center text-zinc-600 mb-8 max-w-md mx-auto">Focus on one item at a time. Clarify what it is and organize it.</p>

            <InboxProcess items={inboxItems} projects={activeProjects} />
        </div>
    )
}

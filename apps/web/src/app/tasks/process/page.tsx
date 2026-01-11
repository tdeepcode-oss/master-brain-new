import { getTasks } from '@/actions/task'
import InboxProcessor from '@/components/tasks/inbox-processor'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProcessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const allTasks = await getTasks(user.id)
    const inboxTasks = allTasks.filter(t => t.status === 'INBOX')

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72 flex flex-col">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Process Inbox</h1>
                <p className="text-zinc-400">Clarify your items one by one.</p>
            </header>

            <div className="flex-1 flex items-center justify-center pb-20">
                <InboxProcessor inboxTasks={inboxTasks} />
            </div>
        </div>
    )
}

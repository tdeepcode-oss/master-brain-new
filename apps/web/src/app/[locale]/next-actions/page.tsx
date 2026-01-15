import { getTasks } from '@/actions/task'
import { InboxList } from '@/components/gtd/inbox-list'
import { createClient } from '@/lib/supabase/server'
import { CheckSquare } from 'lucide-react'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function NextActionsPage() {
    const user = await getUser()

    if (!user) {
        return (
            <div className="p-8">
                <p>Please log in.</p>
            </div>
        )
    }

    const allTasks = await getTasks(user.id)
    const nextTasks = allTasks.filter(t => t.status === 'NEXT')

    // Map tasks to InboxItem type expected by InboxList
    const inboxItems: any[] = nextTasks.map(t => ({
        type: 'TASK',
        data: t
    }))

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Next Actions</h1>
                    </div>
                    <p className="text-zinc-500">Concrete next steps to move projects forward.</p>
                </div>
            </div>

            <InboxList initialItems={inboxItems} />
        </div>
    )
}

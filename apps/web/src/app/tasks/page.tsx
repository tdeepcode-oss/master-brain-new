import NewTaskButton from '@/components/tasks/new-task-button'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export default async function TasksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tasks (GTD)</h1>
                    <p className="text-zinc-400">Capture, Clarify, Organize.</p>
                </div>
                <NewTaskButton />
            </header>

            <div className="text-white border border-dashed border-zinc-700 p-10 rounded-xl text-center">
                <p>Task Board is currently hidden.</p>
                <p className="text-sm text-zinc-500 mt-2">Try adding a task using the button above.</p>
            </div>
        </div>
    )
}

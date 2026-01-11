import { redirect } from 'next/navigation';
import { getTasks } from '../../actions/task';
import { TaskBoard } from '../../components/task/task-board';
import { createClient } from '../../lib/supabase/server';

export default async function TasksPage() {
    console.log("TasksPage: Starting render...")

    let user = null;

    try {
        const supabase = await createClient()
        const authResult = await supabase.auth.getUser()
        user = authResult.data.user
        console.log("TasksPage: User fetched", user?.id)
    } catch (e) {
        console.error("TasksPage: Auth Error", e)
        return (
            <div className="min-h-screen bg-black text-white p-8 md:pl-72">
                <h1 className="text-red-500 text-2xl">Auth Error</h1>
                <pre className="text-zinc-400 mt-4 p-4 bg-zinc-900 rounded">
                    {(e as Error).message}
                </pre>
            </div>
        )
    }

    if (!user) {
        console.log("TasksPage: No user, redirecting")
        redirect('/login')
    }

    const tasks = await getTasks(user.id)

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tasks (GTD)</h1>
                    <p className="text-zinc-400">Capture, Clarify, Organize.</p>
                </div>
                <NewTaskButton />
            </header>

            <TaskBoard tasks={tasks} />

            {/* Debugging info - can be removed later */}
            <div className="mt-8 text-xs text-zinc-600 text-center border-t border-zinc-900 pt-4">
                <p>System Status: Online</p>
                <p>Tasks Loaded: {tasks.length}</p>
            </div>
        </div>
    )
}

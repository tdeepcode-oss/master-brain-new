import { getTasks, Task } from '@/actions/task'
import TaskBoard from '@/components/tasks/task-board'
import { createClient } from '@/lib/supabase/server'
import { Sun } from 'lucide-react'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Reuse the TaskBoard component but filter for My Day tasks
function MyDayBoard({ tasks }: { tasks: Task[] }) {
    // We only want to display one "column" really, or just a list. 
    // Usually My Day aggregates everything into one list.
    // But TaskBoard creates columns by Status.
    // If we want to persist the column view (so user can see if a My Day task is Waiting vs Next), we can use TaskBoard.
    // Let's use TaskBoard for consistency.
    return <TaskBoard initialTasks={tasks} />
}

export default async function TodayPage() {
    const user = await getUser()

    if (!user) {
        return <div className="p-8">Please log in.</div>
    }

    const allTasks = await getTasks(user.id)

    const now = new Date()
    const startOfTomorrow = new Date(now)
    startOfTomorrow.setHours(24, 0, 0, 0)

    const todayTasks = allTasks.filter(t => {
        // Condition 1: Explicity added to My Day (matches today's date)
        if (t.myDayDate && new Date(t.myDayDate).toDateString() === now.toDateString()) {
            return true
        }

        // Condition 2: Due Today (Implicitly My Day, or should we separate?)
        // Usually Due Today is automatically shown in a "Due" section, or merged.
        // Let's merge them for now.
        if (t.dueDate) {
            const d = new Date(t.dueDate)
            if (d < startOfTomorrow && t.status !== 'DONE') return true
        }

        return false
    })

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-white">My Day</h1>
                </div>
                <p className="text-zinc-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </header>

            {todayTasks.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-xl bg-zinc-900/20">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-zinc-900 mb-4">
                        <Sun className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-zinc-400 font-medium text-lg">Your day is clear</h3>
                    <p className="text-zinc-600 mt-2">Add tasks from your lists to focus on them today.</p>
                </div>
            ) : (
                <MyDayBoard tasks={todayTasks} />
            )}
        </div>
    )
}

import { redirect } from 'next/navigation';
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

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tasks (GTD)</h1>
                    <p className="text-zinc-400">Capture, Clarify, Organize.</p>
                </div>
                <NewTaskButton />
                {/* <button disabled className="bg-zinc-800 text-zinc-500 px-4 py-2 rounded cursor-not-allowed border border-zinc-700">
                    + New Task (Disabled)
                </button> */}
            </header>

            <div className="text-white border border-dashed border-zinc-700 p-10 rounded-xl text-center">
                <p className="text-xl font-medium text-green-500 mb-2">Step 2: Testing NewTaskButton</p>
                <p className="text-sm text-zinc-500">If you see this, the button component and its imports (Prisma) are safe.</p>
                <p className="text-sm text-zinc-600 mt-4">Try clicking the button to create a task.</p>
            </div>
        </div>
    )
}

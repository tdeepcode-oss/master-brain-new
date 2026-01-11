import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export default async function TasksPage() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return <div className="p-8 text-red-500">Error: NEXT_PUBLIC_SUPABASE_URL is missing. Please check Vercel Project Settings.</div>
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            redirect('/login')
        }
    } catch (e) {
        console.error('TasksPage Error:', e)
        return <div className="p-8 text-red-500">Error loading tasks page. Check server logs. {(e as Error).message}</div>
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tasks (GTD)</h1>
                    <p className="text-zinc-400">Capture, Clarify, Organize.</p>
                </div>
                {/* <NewTaskButton /> */}
            </header>

            <div className="text-white border border-dashed border-zinc-700 p-10 rounded-xl text-center">
                <p>Task Board is currently hidden.</p>
                <p className="text-sm text-zinc-500 mt-2">Try adding a task using the button above.</p>
            </div>
        </div>
    )
}

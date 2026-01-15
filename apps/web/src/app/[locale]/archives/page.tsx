import { getArchivedItems } from '@/actions/archive'
import ArchiveSystem from '@/components/gtd/archive-system'
import { createClient } from '@/lib/supabase/server'
import { Archive } from 'lucide-react'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function ArchivesPage() {
    const user = await getUser()

    if (!user) return <div className="p-8">Please log in.</div>

    const data = await getArchivedItems()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Archive className="w-6 h-6 text-zinc-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Archives</h1>
                </div>
                <p className="text-zinc-500">View and restore archived projects and tasks.</p>
            </header>

            <ArchiveSystem initialData={data} />
        </div>
    )
}

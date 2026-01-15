import { getAreas } from '@/actions/area'
import AreaGrid from '@/components/para/area-grid'
import { createClient } from '@/lib/supabase/server'
import { LayoutGrid } from 'lucide-react'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function AreasPage() {
    const user = await getUser()

    if (!user) return <div className="p-8">Please log in.</div>

    const areas = await getAreas()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Areas</h1>
                </div>
                <p className="text-zinc-500">Manage your high-level responsibilities (Health, Finances, etc.).</p>
            </header>

            <AreaGrid initialAreas={areas} />
        </div>
    )
}

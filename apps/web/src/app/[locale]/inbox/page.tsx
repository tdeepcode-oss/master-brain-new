import { getInboxItems } from '@/actions/inbox'
import { SmartCapture } from '@/components/gtd/smart-capture'
import UnifiedInboxBoard from '@/components/gtd/unified-inbox-board'
import { createClient } from '@/lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function InboxPage() {
    const user = await getUser()

    if (!user) return <div>Please login.</div>

    const inboxItems = await getInboxItems()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Inbox</h1>
                    <p className="text-zinc-400">Capture everything here. Process to Tasks when ready.</p>
                </div>

                {/* Capture Area - kept simpler but functional */}
                <div className="w-full md:w-96">
                    <SmartCapture />
                </div>
            </header>

            <UnifiedInboxBoard initialItems={inboxItems} />

            <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
                <p>Pro Tip: Clear your inbox daily.</p>
            </div>
        </div>
    )
}

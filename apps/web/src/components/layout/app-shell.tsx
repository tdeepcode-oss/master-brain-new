'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from './sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block z-30 relative">
                <Sidebar />
            </div>

            {/* Mobile Sheet Nav */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 border-r border-white/10 w-[280px]">
                    {/* Remove close button via CSS or custom primitive structure if it overlaps, but for now default is fine */}
                    <Sidebar className="w-full border-0" />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center p-4 border-b border-white/5 bg-zinc-950">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-zinc-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-3 font-bold text-white">Mastery Brain</span>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-black scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}

'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
    Archive,
    Box,
    Calendar,
    CheckSquare,
    Dumbbell,
    FileText,
    Folder,
    Globe,
    GraduationCap,
    Inbox,
    LayoutDashboard,
    Library,
    PlusCircle,
    RotateCw,
    Search,
    Settings,
    UserCircle
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const t = useTranslations('Sidebar')
    const locale = useLocale()
    const router = useRouter()

    const navItems = [
        {
            title: t('actions'),
            items: [
                { href: '/inbox', label: t('inbox'), icon: Inbox },
                { href: '/today', label: t('today'), icon: Calendar },
                { href: '/next-actions', label: t('nextActions'), icon: CheckSquare },
                { href: '/reviews', label: t('reviews'), icon: RotateCw },
            ]
        },
        {
            title: t('structure'),
            items: [
                { href: '/projects', label: t('projects'), icon: Folder },
                { href: '/areas', label: t('areas'), icon: Box },
                { href: '/resources', label: t('resources'), icon: FileText },
                { href: '/archives', label: t('archives'), icon: Archive }, // archive -> archives in translation key
            ]
        },
        {
            title: t('knowledge'),
            items: [
                { href: '/library', label: t('library'), icon: Library },
                { href: '/education', label: t('education'), icon: GraduationCap },
                { href: '/brain', label: t('brainGym'), icon: Dumbbell },
            ]
        }
    ]

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'tr' : 'en'
        router.push(pathname, { locale: newLocale })
    }

    return (
        <aside className={cn("flex flex-col h-full bg-zinc-950 border-r border-white/10 w-64 flex-shrink-0", className)}>
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-6">
                    <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                    Mastery Brain
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 flex items-center gap-2 bg-zinc-900 border border-white/10 text-zinc-400 text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-left">
                        <Search className="w-4 h-4" />
                        <span>{t('search')}</span>
                        <kbd className="ml-auto text-[10px] bg-zinc-800 px-1 rounded border border-white/5">⌘K</kbd>
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition-colors">
                        <PlusCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
                {navItems.map((section) => (
                    <div key={section.title}>
                        <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            {section.title}
                        </h3>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href // usePathname strips locale, so checking logic remains same!

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group relative",
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="space-y-1">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 rounded-md hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{locale === 'en' ? 'English' : 'Türkçe'}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-400 rounded-md hover:bg-white/5 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>{t('settings')}</span>
                    </button>
                    <div className="flex items-center gap-3 px-3 py-2 mt-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <UserCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">User</p>
                            <p className="text-xs text-zinc-500 truncate">user@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

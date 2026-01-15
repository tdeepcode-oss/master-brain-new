import { getLearningStats } from '@/actions/learning'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Brain, Flame, GraduationCap, Play, TrendingUp } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function BrainDashboard() {
    const stats = await getLearningStats()
    const t = await getTranslations('Brain')
    const locale = await getLocale()

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-pink-500" />
                        {t('title')}
                    </h1>
                    <p className="text-zinc-500 mt-1">{t('subtitle')}</p>
                </div>

                <Link href={`/${locale}/brain/review`}>
                    <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/20 border-0">
                        <Play className="w-4 h-4 mr-2" />
                        {t('startReview')} ({stats.dueCards})
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={t('masteryScore')}
                    value={`${stats.masteryScore}%`}
                    icon={<GraduationCap className="w-5 h-5 text-indigo-400" />}
                    desc={t('masteryDesc')}
                />
                <StatCard
                    title={t('totalCards')}
                    value={stats.totalCards}
                    icon={<Brain className="w-5 h-5 text-pink-400" />}
                    desc={t('totalDesc')}
                />
                <StatCard
                    title={t('matureCards')}
                    value={stats.matureCards}
                    icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                    desc={t('matureDesc')}
                />
            </div>

            {/* Placeholder for Activity Heatmap */}
            <Card className="p-6 bg-zinc-900/50 border-white/5">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    {t('activity')}
                </h3>
                <div className="h-32 flex items-center justify-center text-zinc-600 text-sm border-2 border-dashed border-zinc-800 rounded-lg">
                    (Activity Heatmap Visualization Coming Soon)
                </div>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon, desc }: any) {
    return (
        <Card className="p-6 bg-zinc-900 border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 font-medium text-sm">{title}</span>
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-zinc-500">{desc}</div>
        </Card>
    )
}

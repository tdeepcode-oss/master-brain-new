import { Card } from "@/components/ui/card"
import { Activity, Archive, CheckCircle2, Inbox } from "lucide-react"

export function StatsGrid({ stats }: { stats: any }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                label="Inbox"
                value={stats.inboxCount}
                icon={<Inbox className="w-4 h-4 text-zinc-400" />}
                trend={stats.inboxCount > 5 ? "Need processing" : "Under control"}
                trendColor={stats.inboxCount > 5 ? "text-amber-500" : "text-emerald-500"}
            />
            <StatCard
                label="Completed"
                value={stats.completedTodayCount}
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                trend="Today"
            />
            <StatCard
                label="Focus Tasks"
                value={stats.dueTodayCount}
                icon={<Activity className="w-4 h-4 text-indigo-400" />}
                trend="On your plate"
            />
            <StatCard
                label="Streak"
                value={stats.learningStreak}
                icon={<Archive className="w-4 h-4 text-purple-400" />}
                suffix="Days"
            />
        </div>
    )
}

function StatCard({ label, value, icon, trend, trendColor = "text-zinc-500", suffix }: any) {
    return (
        <Card className="p-4 bg-zinc-900 border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
                {value} <span className="text-sm font-normal text-zinc-500">{suffix}</span>
            </div>
            {trend && <div className={`text-xs ${trendColor}`}>{trend}</div>}
        </Card>
    )
}

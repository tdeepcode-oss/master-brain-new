import { Task } from "@/actions/task"
import { Card } from "@/components/ui/card"
import { Check, Clock, Zap } from "lucide-react"
import Link from "next/link"

export function FocusList({ tasks }: { tasks: Task[] }) {
    if (tasks.length === 0) {
        return (
            <Card className="p-8 flex flex-col items-center justify-center text-center bg-zinc-900/50 border-dashed border-zinc-800">
                <Check className="w-12 h-12 text-zinc-700 mb-4" />
                <h3 className="text-zinc-300 font-medium">All Caught Up!</h3>
                <p className="text-zinc-500 text-sm mt-1">Check your Inbox or start a Project.</p>
                <Link href="/tasks" className="mt-4 text-indigo-400 text-sm hover:underline">
                    View All Tasks
                </Link>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <div key={task.id} className="group flex items-start gap-4 p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-indigo-500/30 hover:bg-zinc-800/50 transition-all cursor-pointer">
                    <button className="mt-1 w-5 h-5 rounded border border-zinc-600 group-hover:border-indigo-500 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                        {/* Placeholder for completion logic */}
                    </button>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-zinc-200 font-medium truncate group-hover:text-white transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                            {task.priority === 'URGENT' && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">URGENT</span>}
                            {task.dueDate && (
                                <span className="flex items-center text-xs text-zinc-500">
                                    <Clock className="w-3 h-3 mr-1" /> Today
                                </span>
                            )}
                            {task.energyLevel && (
                                <span className="flex items-center text-xs text-zinc-500">
                                    <Zap className="w-3 h-3 mr-1" /> {task.energyLevel}
                                </span>
                            )}
                            <span className="text-xs text-zinc-600 bg-zinc-800/80 px-1.5 rounded">{task.status}</span>
                        </div>
                    </div>
                </div>
            ))}
            <Link href="/today" className="block text-center text-xs text-zinc-500 hover:text-indigo-400 py-2">
                View Full Today View →
            </Link>
        </div>
    )
}

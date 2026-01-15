import { Card } from "@/components/ui/card"
import { ArrowRight, Folder } from "lucide-react"
import Link from "next/link"

export function ProjectGrid({ projects }: { projects: any[] }) {
    if (projects.length === 0) {
        return <div className="text-sm text-zinc-500 italic">No active projects. Time to dream big?</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
                <Link href={`/projects/${p.id}`} key={p.id}>
                    <Card className="p-4 bg-zinc-900 border-white/5 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all group h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Folder className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full uppercase">{p.status}</span>
                            </div>
                            <h3 className="font-semibold text-zinc-200 group-hover:text-white mb-2">{p.name}</h3>
                        </div>

                        {p.nextAction ? (
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Next Step</p>
                                <p className="text-xs text-zinc-300 line-clamp-1">{p.nextAction}</p>
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Dashboard <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    )
}

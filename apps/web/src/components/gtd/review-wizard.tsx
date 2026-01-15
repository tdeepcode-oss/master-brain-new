'use client'

import { ReviewData } from '@/actions/review'
import { updateTaskStatus } from '@/actions/task'
import { ArrowLeft, ArrowRight, Brain, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ReviewWizard({ data }: { data: ReviewData }) {
    const [step, setStep] = useState<'WELCOME' | 'CLEAR' | 'CURRENT' | 'CREATIVE' | 'FINISH'>('WELCOME')
    const router = useRouter()

    const screens = {
        WELCOME: (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold">Weekly Review</h1>
                <p className="text-xl text-zinc-400 max-w-md mx-auto">
                    Clear your mind. Get current. Get creative.
                    <br />
                    <span className="text-sm text-zinc-600 mt-2 block">Estimated time: 10 mins</span>
                </p>
                <button
                    onClick={() => setStep('CLEAR')}
                    className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                >
                    Start Review <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        ),
        CLEAR: <StepClear data={data} onNext={() => setStep('CURRENT')} />,
        CURRENT: <StepCurrent data={data} onNext={() => setStep('CREATIVE')} onBack={() => setStep('CLEAR')} />,
        CREATIVE: <StepCreative data={data} onNext={() => setStep('FINISH')} onBack={() => setStep('CURRENT')} />,
        FINISH: (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-bold">You're all set!</h1>
                <p className="text-xl text-zinc-400">
                    Your system is current and your mind is clear.
                </p>
                <button
                    onClick={() => router.push('/tasks')}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
                >
                    Go to Tasks <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-4xl mx-auto p-4">
            {step !== 'WELCOME' && step !== 'FINISH' && (
                <div className="w-full flex justify-between items-center mb-12 text-sm text-zinc-500 uppercase tracking-widest">
                    <span className={step === 'CLEAR' ? 'text-white' : ''}>1. Get Clear</span>
                    <span className={step === 'CURRENT' ? 'text-white' : ''}>2. Get Current</span>
                    <span className={step === 'CREATIVE' ? 'text-white' : ''}>3. Get Creative</span>
                </div>
            )}
            <div className="w-full">
                {screens[step]}
            </div>
        </div>
    )
}

function StepClear({ data, onNext }: { data: ReviewData, onNext: () => void }) {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Get Clear</h2>
                <p className="text-zinc-500">Empty your head. Are there any loose ends?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold mb-4">Inbox Status</h3>
                    <div className="text-3xl font-bold text-white mb-2">{data.inboxCount} items</div>
                    <p className="text-sm text-zinc-500">waiting to be processed</p>
                    {data.inboxCount > 0 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-500 text-sm rounded-lg border border-yellow-500/20">
                            Tip: Process your inbox after this review.
                        </div>
                    )}
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold mb-4">Brain Dump</h3>
                    <textarea
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm h-32 md:h-40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        placeholder="What's on your mind? Type it here and we'll add it to your inbox later..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                // Ideal world: Save to inbox
                                alert("Quick capture not connected in this demo step.")
                            }
                        }}
                    />
                    <p className="text-xs text-zinc-600 mt-2 text-right">Cmd+Enter to save</p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={onNext} className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function StepCurrent({ data, onNext, onBack }: { data: ReviewData, onNext: () => void, onBack: () => void }) {
    const [waitingTasks, setWaitingTasks] = useState(data.waitingTasks)

    const markReceived = async (id: string) => {
        setWaitingTasks(prev => prev.filter(t => t.id !== id))
        await updateTaskStatus(id, 'DONE')
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Get Current</h2>
                <p className="text-zinc-500">Review Waiting list and Active Projects.</p>
            </div>

            <div className="space-y-6">
                {/* WAITING LIST */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold mb-4 flex justify-between">
                        Waiting For
                        <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">{waitingTasks.length}</span>
                    </h3>
                    {waitingTasks.length === 0 ? (
                        <p className="text-zinc-500 text-sm italic">Nothing you are waiting for.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {waitingTasks.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                                    <span className="text-sm truncate">{t.title}</span>
                                    <button onClick={() => markReceived(t.id)} className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline">
                                        Mark Received
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PROJECTS */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                    <h3 className="font-semibold mb-4">Active Projects</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {data.activeProjects.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium block">{p.name}</span>
                                    <span className="text-xs text-zinc-500">{p._count.tasks} tasks</span>
                                </div>
                                {/* Simple actions? */}
                            </div>
                        ))}
                        {data.activeProjects.length === 0 && (
                            <p className="text-zinc-500 text-sm italic">No active projects.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={onNext} className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function StepCreative({ data, onNext, onBack }: { data: ReviewData, onNext: () => void, onBack: () => void }) {
    const [somedayTasks, setSomeday] = useState(data.somedayTasks)

    const promoteToNext = async (id: string) => {
        setSomeday(prev => prev.filter(t => t.id !== id))
        await updateTaskStatus(id, 'NEXT')
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Get Creative</h2>
                <p className="text-zinc-500">Review Someday/Maybe. Any bold new ideas?</p>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="font-semibold mb-4 flex justify-between">
                    Someday / Maybe
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">{somedayTasks.length}</span>
                </h3>
                {somedayTasks.length === 0 ? (
                    <p className="text-zinc-500 text-sm italic">No someday items.</p>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {somedayTasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg group">
                                <span className="text-sm truncate text-zinc-400 group-hover:text-zinc-200 transition-colors">{t.title}</span>
                                <button onClick={() => promoteToNext(t.id)} className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                    Make Active
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={onNext} className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    Finish Review <CheckCircle2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

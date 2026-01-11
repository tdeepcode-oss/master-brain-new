'use client'

import { createTask } from '@/actions/task'
import { useState } from 'react'

export default function NewTaskButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await createTask(formData)
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
                + New Task
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Capture New Task</h3>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold">What is it?</label>
                        <input
                            name="title"
                            type="text"
                            autoFocus
                            required
                            placeholder="e.g. Call Lawyer, Buy Milk"
                            className="w-full bg-zinc-800 border-none rounded-md mt-1 p-2 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 uppercase font-bold">Priority</label>
                        <select name="priority" className="w-full bg-zinc-800 border-none rounded-md mt-1 p-2 text-white">
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="LOW">Low</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white px-3 py-2 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            {loading ? 'Saving...' : 'Add to Inbox'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

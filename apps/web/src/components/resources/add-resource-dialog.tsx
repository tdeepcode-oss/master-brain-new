'use client'

import { createResource } from '@/actions/resource'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export function AddResourceDialog({ projects }: { projects: any[] }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                </DialogHeader>
                <form action={async (formData) => {
                    await createResource(formData)
                    setOpen(false)
                }} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase font-bold">Title</label>
                        <input
                            name="title"
                            placeholder="Resource Title"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400 uppercase font-bold">URL (Optional)</label>
                        <input
                            name="url"
                            placeholder="https://..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase font-bold">Type</label>
                            <select
                                name="type"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                            >
                                <option value="LINK">Link</option>
                                <option value="BOOK">Book</option>
                                <option value="COURSE">Course</option>
                                <option value="FILE">File</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase font-bold">Project (Optional)</label>
                            <select
                                name="projectId"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                            >
                                <option value="">None</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Resource</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

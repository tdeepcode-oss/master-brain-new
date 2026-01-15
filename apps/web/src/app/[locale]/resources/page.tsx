import { getProjects } from '@/actions/project'
import { getResources } from '@/actions/resource'
import { AddResourceDialog } from '@/components/resources/add-resource-dialog'
import { ResourceCard } from '@/components/resources/resource-card'
import { Book, File, GraduationCap, Link as LinkIcon, Search } from 'lucide-react'

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    // Filter logic
    const { type } = await searchParams
    const filter = type ? { type: type as any } : undefined
    const resources = await getResources(filter)
    const projects = await getProjects()

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black">
            {/* Header */}
            <div className="flex flex-col gap-6 p-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl z-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            Resource Library
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Collection of links, books, and files for your projects.</p>
                    </div>
                    <AddResourceDialog projects={projects} />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <FilterButton active={!type} href="/resources" label="All" />
                    <FilterButton active={type === 'LINK'} href="/resources?type=LINK" label="Links" icon={<LinkIcon className="w-3 h-3" />} />
                    <FilterButton active={type === 'BOOK'} href="/resources?type=BOOK" label="Books" icon={<Book className="w-3 h-3" />} />
                    <FilterButton active={type === 'COURSE'} href="/resources?type=COURSE" label="Courses" icon={<GraduationCap className="w-3 h-3" />} />
                    <FilterButton active={type === 'FILE'} href="/resources?type=FILE" label="Files" icon={<File className="w-3 h-3" />} />
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {resources.map(resource => (
                        <div key={resource.id} className="aspect-[4/3] md:aspect-auto h-full">
                            {/* @ts-ignore */}
                            <ResourceCard resource={resource} />
                        </div>
                    ))}

                    {resources.length === 0 && (
                        <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                            <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                            <h3 className="text-zinc-400 font-medium">No resources found</h3>
                            <p className="text-zinc-600 mt-2 text-sm">Add a link or file to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function FilterButton({ active, href, label, icon }: any) {
    return (
        <a
            href={href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${active
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                }`}
        >
            {icon}
            {label}
        </a>
    )
}

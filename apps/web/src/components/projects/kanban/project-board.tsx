'use client'

import { Project, updateProjectStatus } from '@/actions/project';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ProjectKanbanCard } from './project-kanban-card';

type ProjectStatus = Project['status'];

const COLUMNS: { id: ProjectStatus | 'PLANNING_GROUP', title: string, statuses: ProjectStatus[] }[] = [
    { id: 'IDEA', title: 'Idea', statuses: ['IDEA'] },
    { id: 'PLANNING_GROUP', title: 'Planning', statuses: ['RESEARCH', 'PLANNING'] }, // Simplified view: Grouping Research & Planning
    { id: 'ACTIVE', title: 'Active', statuses: ['ACTIVE'] },
    { id: 'REVIEW', title: 'Review', statuses: ['REVIEW'] },
    { id: 'COMPLETED', title: 'Done', statuses: ['COMPLETED'] }
];

export function ProjectBoard({ initialProjects }: { initialProjects: Project[] }) {
    const [projects, setProjects] = useState(initialProjects);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic UI Update
        const droppableId = destination.droppableId;

        // Handle the "Planning Group" edge case - default to 'PLANNING' if dropped there
        let targetStatus: ProjectStatus;

        if (droppableId === 'PLANNING_GROUP') {
            targetStatus = 'PLANNING';
        } else {
            targetStatus = droppableId as ProjectStatus;
        }

        const updatedProjects = projects.map(p =>
            p.id === draggableId ? { ...p, status: targetStatus } : p
        );

        setProjects(updatedProjects);

        // Server Action
        try {
            await updateProjectStatus(draggableId, targetStatus as ProjectStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            setProjects(projects); // Revert on failure
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start select-none">
                {COLUMNS.map(col => {
                    // Filter projects for this column
                    const colProjects = projects.filter(p =>
                        col.id === 'PLANNING_GROUP'
                            ? ['RESEARCH', 'PLANNING'].includes(p.status)
                            : p.status === col.id
                    );

                    return (
                        <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col shrink-0">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${col.id === 'ACTIVE' ? 'bg-indigo-500 animate-pulse' :
                                        col.id === 'COMPLETED' ? 'bg-emerald-500' : 'bg-zinc-700'
                                        }`} />
                                    {col.title}
                                    <span className="bg-zinc-800 text-zinc-500 text-[10px] px-1.5 rounded-full ml-1">
                                        {colProjects.length}
                                    </span>
                                </h3>
                                <button className="hover:bg-white/10 p-1 rounded text-zinc-500 hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 min-h-[150px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-800/30 ring-1 ring-white/10' : 'bg-zinc-900/10'
                                            }`}
                                    >
                                        {colProjects.map((project, index) => (
                                            <ProjectKanbanCard key={project.id} project={project} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}

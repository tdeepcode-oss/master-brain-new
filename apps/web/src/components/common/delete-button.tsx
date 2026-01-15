'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function DeleteButton({
    onDelete,
    label,
    className,
    iconOnly = false
}: {
    onDelete: () => Promise<void>,
    label?: string,
    className?: string,
    iconOnly?: boolean
}) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        await onDelete()
        // No need to reset, page will refresh/redirect usually
    }

    if (isConfirming) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <span className="text-xs text-red-500 font-medium">Sure?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                    {isDeleting ? '...' : 'Yes'}
                </button>
                <button
                    onClick={() => setIsConfirming(false)}
                    className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded"
                >
                    No
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className={className || "text-zinc-500 hover:text-red-500 transition-colors"}
            title="Delete"
        >
            <Trash2 className="w-4 h-4" />
            {!iconOnly && label && <span className="ml-2">{label}</span>}
        </button>
    )
}

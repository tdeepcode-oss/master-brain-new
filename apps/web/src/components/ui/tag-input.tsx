'use client'

import { createTag, searchTags } from '@/actions/tag'
import { Plus, Tag as TagIcon, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface Tag {
    id: string
    name: string
}

interface TagInputProps {
    initialTags?: Tag[]
    onTagsChange: (tags: Tag[]) => void
}

export function TagInput({ initialTags = [], onTagsChange }: TagInputProps) {
    const [tags, setTags] = useState<Tag[]>(initialTags)
    const [inputValue, setInputValue] = useState('')
    const [suggestions, setSuggestions] = useState<Tag[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounced search
    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }
        const results = await searchTags(query)
        // Filter out already selected tags
        setSuggestions(results.filter(r => !tags.some(t => t.id === r.id)))
    }, 300)

    useEffect(() => {
        debouncedSearch(inputValue)
    }, [inputValue, debouncedSearch])

    const handleAddTag = async (tag: Tag) => {
        const newTags = [...tags, tag]
        setTags(newTags)
        onTagsChange(newTags)
        setInputValue('')
        setSuggestions([])
        inputRef.current?.focus()
    }

    const handleCreateTag = async () => {
        if (!inputValue.trim()) return
        const newTag = await createTag(inputValue.trim())
        if (!tags.some(t => t.id === newTag.id)) {
            handleAddTag(newTag)
        } else {
            setInputValue('')
        }
    }

    const handleRemoveTag = (id: string) => {
        const newTags = tags.filter(t => t.id !== id)
        setTags(newTags)
        onTagsChange(newTags)
    }

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const matchingSuggestion = suggestions.find(s => s.name.toLowerCase() === inputValue.toLowerCase())
            if (matchingSuggestion) {
                handleAddTag(matchingSuggestion)
            } else {
                await handleCreateTag()
            }
        }
        if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            handleRemoveTag(tags[tags.length - 1].id)
        }
    }

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
                {tags.map(tag => (
                    <span key={tag.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {tag.name}
                        <button onClick={() => handleRemoveTag(tag.id)} className="hover:text-indigo-300">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                <div className="relative flex-1 min-w-[120px]">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500">
                        <TagIcon className="w-3 h-3" />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                        placeholder="Add tag..."
                        className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none pl-5 py-1"
                    />
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && inputValue && (
                <div className="absolute top-full left-0 mt-2 w-full max-w-xs bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                    {suggestions.map(suggestion => (
                        <button
                            key={suggestion.id}
                            onClick={() => handleAddTag(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <TagIcon className="w-3 h-3 text-zinc-500" />
                            {suggestion.name}
                        </button>
                    ))}
                    {suggestions.length === 0 && (
                        <button onClick={handleCreateTag} className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:bg-zinc-800 flex items-center gap-2">
                            <Plus className="w-3 h-3" />
                            Create "{inputValue}"
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

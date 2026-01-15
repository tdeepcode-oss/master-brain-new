'use client'

import { useEffect, useState } from 'react'

export function Greeting({ userName }: { userName: string }) {
    const [greeting, setGreeting] = useState('Welcome')
    const [dateString, setDateString] = useState('')

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good Morning')
        else if (hour < 18) setGreeting('Good Afternoon')
        else setGreeting('Good Evening')

        setDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    }, [])

    return (
        <div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1 uppercase tracking-wide font-medium">
                {dateString}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{userName}</span>
            </h1>
        </div>
    )
}

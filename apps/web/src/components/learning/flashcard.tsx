'use client'

import { motion } from 'framer-motion'

interface FlashcardProps {
    front: string
    back: string
    isFlipped: boolean
    onFlip: () => void
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
    return (
        <div className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer" onClick={onFlip}>
            <motion.div
                className="relative w-full h-full text-center transition-all duration-500 transform-style-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center p-8 shadow-2xl">
                    <div className="text-3xl font-medium text-white">{front}</div>
                    <div className="absolute bottom-4 text-xs text-zinc-500 uppercase tracking-widest">Tap to flip</div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-zinc-800 border border-indigo-500/30 rounded-2xl flex items-center justify-center p-8 shadow-2xl rotate-y-180">
                    <div className="text-2xl text-zinc-200">{back}</div>
                </div>
            </motion.div>
        </div>
    )
}

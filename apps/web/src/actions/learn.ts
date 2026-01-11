'use server'

export type Lesson = {
    id: string
    title: string
    slug: string
    order: number
    duration: string // e.g. "10 min"
    content?: string
}

export type Module = {
    id: string
    title: string
    description: string
    order: number
    lessons: Lesson[]
}

export type Course = {
    id: string
    title: string
    description: string
    slug: string
    coverImage: string
    modules: Module[]
}

const mockCourses: Course[] = [
    {
        id: 'c1',
        title: 'Advanced System Design',
        description: 'Master the art of designing scalable, reliable, and maintainable systems.',
        slug: 'advanced-system-design',
        coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
        modules: [
            {
                id: 'm1',
                title: 'Foundations of Scalability',
                description: 'Core concepts every architect must know.',
                order: 1,
                lessons: [
                    { id: 'l1', title: 'Vertical vs Horizontal Scaling', slug: 'scaling-types', order: 1, duration: '12 min', content: '# Vertical vs Horizontal Scaling\n\nContent goes here...' },
                    { id: 'l2', title: 'Load Balancing Strategies', slug: 'load-balancing', order: 2, duration: '15 min', content: '# Load Balancing\n\nContent goes here...' },
                ]
            },
            {
                id: 'm2',
                title: 'Database Architecture',
                description: 'Deep dive into data storage patterns.',
                order: 2,
                lessons: [
                    { id: 'l3', title: 'Sharding vs Partitioning', slug: 'sharding', order: 1, duration: '20 min' },
                    { id: 'l4', title: 'CAP Theorem in Practice', slug: 'cap-theorem', order: 2, duration: '10 min' },
                ]
            }
        ]
    },
    {
        id: 'c2',
        title: 'Neuroscience of Learning',
        description: 'Understanding how your brain actually learns to optimize your study habits.',
        slug: 'neuroscience-learning',
        coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop',
        modules: []
    }
]

export async function getCourses() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCourses
}

export async function getCourse(slug: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCourses.find(c => c.slug === slug)
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const course = mockCourses.find(c => c.slug === courseSlug)
    if (!course) return null

    for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.slug === lessonSlug)
        if (lesson) return { course, module, lesson }
    }
    return null
}

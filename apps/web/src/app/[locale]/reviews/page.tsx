import { getReviewData } from '@/actions/review'
import ReviewWizard from '@/components/gtd/review-wizard'
import { createClient } from '@/lib/supabase/server'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export default async function ReviewsPage() {
    const user = await getUser()

    if (!user) return <div className="p-8">Please log in.</div>

    // Fetch initial data for the review
    const data = await getReviewData()

    return (
        <div className="min-h-screen bg-black text-white p-8 md:pl-72 flex flex-col justify-center">
            <ReviewWizard data={data} />
        </div>
    )
}

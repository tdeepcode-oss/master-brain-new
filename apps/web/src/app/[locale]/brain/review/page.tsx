import { getDueFlashcards } from '@/actions/learning'
import { ReviewSession } from '@/components/learning/review-session'

export default async function ReviewPage() {
    const cards = await getDueFlashcards()

    return (
        <ReviewSession initialCards={cards} />
    )
}

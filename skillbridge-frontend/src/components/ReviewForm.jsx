import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import StarRating from './StarRating'

const ReviewForm = ({ projectId, revieweeId, onSuccess }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reviews', {
        projectId,
        revieweeId,
        rating,
        comment: comment.trim() || undefined,
      })
      
      toast.success('Review submitted successfully!')
      setRating(5)
      setComment('')
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
      
      <div className="space-y-4">
        <div>
          <label className="label">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-transform hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="label">
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            rows="4"
            className="input-field"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm

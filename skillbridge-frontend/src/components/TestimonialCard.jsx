import StarRating from './StarRating'

const TestimonialCard = ({ name, role, image, rating, text }) => {
  return (
    <div className="card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
          {image || name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <StarRating rating={rating} size="sm" />
      <p className="text-gray-700 mt-3 italic">"{text}"</p>
    </div>
  )
}

export default TestimonialCard

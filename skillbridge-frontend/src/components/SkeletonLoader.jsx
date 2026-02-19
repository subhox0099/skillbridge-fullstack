const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

export const CardSkeleton = () => (
  <div className="card">
    <SkeletonLoader className="h-6 w-3/4 mb-4" />
    <SkeletonLoader className="h-4 w-full mb-2" />
    <SkeletonLoader className="h-4 w-full mb-2" />
    <SkeletonLoader className="h-4 w-1/2 mb-4" />
    <SkeletonLoader className="h-10 w-full rounded-lg" />
  </div>
)

export const TableRowSkeleton = () => (
  <div className="flex gap-4 p-4 border-b border-gray-200">
    <SkeletonLoader className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1">
      <SkeletonLoader className="h-4 w-1/3 mb-2" />
      <SkeletonLoader className="h-3 w-1/2" />
    </div>
    <SkeletonLoader className="h-8 w-24 rounded" />
  </div>
)

export default SkeletonLoader

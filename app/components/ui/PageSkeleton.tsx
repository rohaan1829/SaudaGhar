import { Skeleton } from './Skeleton'

export function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" variant="circular" />
        <Skeleton className="h-4 w-32 mx-auto" variant="text" />
      </div>
    </div>
  )
}


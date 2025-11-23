import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" variant="text" />
        <Skeleton className="h-4 w-64" variant="text" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-32 mb-2" variant="text" />
            <Skeleton className="h-10 w-20" variant="text" />
          </Card>
        ))}
      </div>

      {/* Button Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-48 rounded-lg" variant="rectangular" />
      </div>

      {/* Recent Listings Card Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" variant="text" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" variant="text" />
                  <Skeleton className="h-4 w-1/2" variant="text" />
                </div>
                <Skeleton className="h-6 w-16 rounded" variant="rectangular" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


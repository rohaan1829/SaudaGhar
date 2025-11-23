import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'

export function ListingsSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-40" variant="text" />
        <Skeleton className="h-10 w-48 rounded-lg" variant="rectangular" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" variant="rectangular" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" variant="text" />
              <Skeleton className="h-4 w-1/2" variant="text" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" variant="text" />
                <Skeleton className="h-5 w-20" variant="text" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded" variant="rectangular" />
                <Skeleton className="h-8 w-16 rounded" variant="rectangular" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


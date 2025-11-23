import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'

export function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-32 mb-6" variant="text" />
      
      <Card className="p-6">
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-40" variant="text" />
            <Skeleton className="h-6 w-20 rounded-full" variant="rectangular" />
          </div>
          <Skeleton className="h-4 w-32" variant="text" />
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" variant="text" />
              <Skeleton className="h-10 w-full rounded-lg" variant="rectangular" />
            </div>
          ))}
          <Skeleton className="h-12 w-32 rounded-lg mt-4" variant="rectangular" />
        </div>
      </Card>
    </div>
  )
}


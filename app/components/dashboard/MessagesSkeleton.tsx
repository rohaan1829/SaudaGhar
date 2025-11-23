import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'

export function MessagesSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-32 mb-6" variant="text" />
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" variant="text" />
                <Skeleton className="h-4 w-full" variant="text" />
                <Skeleton className="h-4 w-2/3" variant="text" />
                <Skeleton className="h-3 w-24" variant="text" />
              </div>
              <Skeleton className="h-3 w-3 rounded-full" variant="circular" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


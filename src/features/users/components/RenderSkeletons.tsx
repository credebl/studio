import { Skeleton } from '@/components/ui/skeleton'

const skeletonIds = ['skeleton-1', 'skeleton-2', 'skeleton-3']

const renderSkeletons = (): React.JSX.Element[] =>
  skeletonIds.map((id) => (
    <div
      key={id}
      className="bg-background animate-pulse rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-40" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  ))

export default renderSkeletons

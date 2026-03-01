import { Skeleton } from "@/components/ui/skeleton";

const MobilePreviewSkeleton = () => (
  <div className="flex flex-col h-full p-4 gap-4 bg-background">
    <Skeleton className="h-12 w-3/4 rounded-lg" />
    <Skeleton className="h-6 w-1/2 rounded-md" />
    <div className="flex gap-3 mt-2">
      <Skeleton className="h-24 w-24 rounded-xl" />
      <Skeleton className="h-24 w-24 rounded-xl" />
      <Skeleton className="h-24 w-24 rounded-xl" />
    </div>
    <Skeleton className="h-32 w-full rounded-xl mt-2" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-10 w-full rounded-lg mt-auto" />
  </div>
);

export default MobilePreviewSkeleton;

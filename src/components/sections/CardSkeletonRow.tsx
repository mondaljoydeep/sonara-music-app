import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-36 sm:w-40 lg:w-48">
          <Skeleton className="aspect-square w-full mb-2 rounded-lg bg-[#22222e]" />
          <Skeleton className="h-3 w-3/4 mb-1 bg-[#22222e]" />
          <Skeleton className="h-3 w-1/2 bg-[#22222e]" />
        </div>
      ))}
    </div>
  );
}

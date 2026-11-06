import { Skeleton } from "@/app/components/ui/Skeleton";
import type { AuthFormSkeletonProps } from "../types";

export function AuthFormSkeleton({ fields }: AuthFormSkeletonProps) {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="custom" className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton variant="custom" className="mt-2 h-11 w-full rounded-xl" />
    </div>
  );
}
